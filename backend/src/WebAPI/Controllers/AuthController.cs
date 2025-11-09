using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly RefreshTokenService _rtService;
    private readonly EmailService _email;
    private readonly MfaService _mfa;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserRepository users, RefreshTokenService rtService, EmailService email, MfaService mfa, IConfiguration config, ILogger<AuthController> logger)
    {
        _users = users; _rtService = rtService; _email = email; _mfa = mfa; _config = config; _logger = logger;
    }

    public record RegisterDto(string Email, string Password, string? Mobile, string? FullName);
    public record LoginDto(string Email, string Password, string? TotpCode);
    public record RefreshDto(string RefreshToken);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password)) return BadRequest("Email/password required");

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();
        var (valid, message) = policy.ValidatePassword(dto.Password);
        if (!valid) return BadRequest(new { message });


        var existing = await _users.GetByEmailAsync(dto.Email);
        if (existing != null) return BadRequest("Email exists");

        var user = new User { Email = dto.Email, Mobile = dto.Mobile, FullName = dto.FullName ?? dto.Email, RoleId = 5, IsActive = true, IsApproved = false };
        user.PasswordHash = HashPassword(dto.Password);
        user.PasswordLastChanged = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90));

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();
        await historyService.AddToHistoryAsync(user);

        var otp = GenerateOtp(6);
        await _email.SendEmailAsync(user.Email, "Verify your account - FinServe", $"Your verification code is {otp} (demo). Use verify endpoints to mark verified.");

        var adminEmail = _config["Admin:NotificationEmail"];
        if (!string.IsNullOrEmpty(adminEmail)) await _email.SendEmailAsync(adminEmail, "New user pending approval", $"User {user.Email} registered. Id:{user.Id}");

        return Ok(new { message = "Registered. Verify email & mobile and wait for admin approval.", userId = user.Id });
    }

    [HttpPost("verify-email")] public async Task<IActionResult> VerifyEmail([FromBody] dynamic body) 
    { 
        int userId = (int)body.userId; 
        var user = await _users.GetByIdAsync(userId); 
        if (user == null) 
            return NotFound(); 
        user.EmailVerified = true; 
        await _users.UpdateAsync(user); 
        await _users.SaveChangesAsync(); 
        return Ok(new { message = "Email verified" }); 
    }
    [HttpPost("verify-mobile")] 
    public async Task<IActionResult> VerifyMobile([FromBody] dynamic body) 
    { 
        int userId = (int)body.userId; 
        var user = await _users.GetByIdAsync(userId); 
        if (user == null) 
            return NotFound(); 
        user.MobileVerified = true; 
        await _users.UpdateAsync(user); 
        await _users.SaveChangesAsync(); 
        return Ok(new { message = "Mobile verified" }); 
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email);
        if (user == null) return Unauthorized();

        if (!user.IsApproved) return Forbid("User not approved");
        if (!user.EmailVerified || !user.MobileVerified) return Forbid("Email and mobile must be verified");
        if (user.LockoutEndAt.HasValue && user.LockoutEndAt.Value > DateTime.UtcNow) return Forbid("Account locked");

        //var password = HashPassword("Admin@FinServe123!");

        if (!VerifyHashedPassword(user.PasswordHash, dto.Password))
        {
            user.FailedLoginCount++;
            if (user.FailedLoginCount >= _config.GetValue("Security:Lockout:MaxFailedAttempts", 5))
            {
                user.LockoutEndAt = DateTime.UtcNow.AddMinutes(_config.GetValue("Security:Lockout:LockoutMinutes", 15));
                user.FailedLoginCount = 0;
            }
            await _users.UpdateAsync(user); await _users.SaveChangesAsync();
            return Unauthorized("Invalid credentials");
        }

        user.FailedLoginCount = 0; await _users.UpdateAsync(user); await _users.SaveChangesAsync();

        if (user.MfaEnabled)
        {
            if (string.IsNullOrEmpty(dto.TotpCode) || !_mfa.ValidateTotp(user.MfaSecret ?? string.Empty, dto.TotpCode))
                return Forbid("MFA required/invalid");
        }

        var accessToken = GenerateJwt(user);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var refresh = await _rtService.CreateRefreshTokenAsync(user.Id, ip, days: 30);
        return Ok(new { accessToken, refreshToken = refresh.Token, user = new { user.Id, user.Email, user.FullName, role = user.Role?.Name } });
    }

    [HttpPost("refresh")] 
    public async Task<IActionResult> Refresh([FromBody] RefreshDto dto) 
    { 
        var rt = await _rtService.GetValidRefreshTokenAsync(dto.RefreshToken); 
        if (rt == null) 
            return Unauthorized(); 
        var newRt = await _rtService.CreateRefreshTokenAsync(rt.UserId, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown", 30); 
        await _rtService.RevokeAsync(rt, "rotated", newRt.Token); 
        var user = await _users.GetByIdAsync(rt.UserId); 
        
        if (user == null) 
            return Unauthorized(); 
        var accessToken = GenerateJwt(user); 
        return Ok(new { accessToken, refreshToken = newRt.Token }); 
    }

    [HttpPost("logout")] 
    public async Task<IActionResult> Logout([FromBody] dynamic body) 
    { 
        string token = (string)body.refreshToken; 
        var rt = await _rtService.GetValidRefreshTokenAsync(token); 

        if (rt != null) 
            await _rtService.RevokeAsync(rt, "logout"); 
        return Ok(new { message = "Logged out" }); 
    }

    [HttpPut("admin/approve/{id}")] 
    public async Task<IActionResult> ApproveUser(int id) 
    { 
        var user = await _users.GetByIdAsync(id); 
        if (user == null) 
            return NotFound();
        
        user.IsApproved = true; 
        await _users.UpdateAsync(user); 
        await _users.SaveChangesAsync(); 
        await _email.SendEmailAsync(user.Email, "Account approved", "Your account is approved by admin.");
        return Ok(new { message = "Approved" }); 
    }

    // Helpers (PBKDF2)
    private static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        byte[] result = new byte[49];
        result[0] = 0x01;
        Buffer.BlockCopy(salt, 0, result, 1, 16);
        Buffer.BlockCopy(hash, 0, result, 17, 32);
        return Convert.ToBase64String(result);
    }

    private static bool VerifyHashedPassword(string hash, string password)
    {
        var bytes = Convert.FromBase64String(hash);
        var salt = new byte[16];
        Buffer.BlockCopy(bytes, 1, salt, 0, 16);
        var stored = new byte[32];
        Buffer.BlockCopy(bytes, 17, stored, 0, 32);
        var derived = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(stored, derived);
    }

    private static string GenerateOtp(int digits)
    {
        var rng = RandomNumberGenerator.GetInt32(0, (int)Math.Pow(10, digits));
        return rng.ToString($"D{digits}");
    }

    private string GenerateJwt(User user)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ReplaceWithStrongKey");
        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
        var claims = new[] 
        { 
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Name, user.FullName), new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer") };
        var token = new JwtSecurityToken(issuer: _config["Jwt:Issuer"], audience: _config["Jwt:Audience"], claims: claims, expires: DateTime.UtcNow.AddMinutes(_config.GetValue("Jwt:ExpiryMinutes", 15)), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] dynamic body, [FromServices] PasswordResetService resetService)
    {
        string email = (string)body.email;
        var user = await _users.GetByEmailAsync(email);
        if (user == null)
        {
            // Return same message to prevent enumeration
            return Ok(new { message = "If account exists, a reset link has been sent." });
        }

        var tokenEntity = await resetService.CreateTokenAsync(user.Id, 30);
        var resetUrl = $"{Request.Scheme}://{Request.Host}/reset/{Uri.EscapeDataString(tokenEntity.Token)}";

        await _email.SendEmailAsync(user.Email, "Password reset request",
            $"<p>Hello {user.FullName},</p><p>Click below to reset your password:</p><p><a href='{resetUrl}'>Reset Password</a></p><p>This link will expire in 30 minutes.</p>");

        return Ok(new { message = "If account exists, a reset link has been sent." });
    }


    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] dynamic body, [FromServices] PasswordResetService resetService)
    {
        string token = (string)body.token;
        string newPassword = (string)body.newPassword;

        var user = await resetService.ValidateTokenAsync(token);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid or expired reset token." });
        }

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();
        var (valid, message) = policy.ValidatePassword(newPassword);
        if (!valid) return BadRequest(new { message });

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();

        if (await historyService.IsPasswordReusedAsync(user, newPassword))
            return BadRequest(new { message = "You cannot reuse any of your last passwords." });

        user.PasswordHash = HashPassword(newPassword);
        user.PasswordLastChanged = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90));

        await _users.UpdateAsync(user);
        await _users.SaveChangesAsync();
        await historyService.AddToHistoryAsync(user);

        await _email.SendEmailAsync(user.Email, "Password Reset Successful", "Your password has been reset successfully.");

        return Ok(new { message = "Password reset successful." });
    }

    [HttpDelete("cleanup-reset-tokens")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cleanup([FromServices] AppDbContext db)
    {
        var expired = db.PasswordResetTokens.Where(t => t.ExpiresAt < DateTime.UtcNow);
        db.PasswordResetTokens.RemoveRange(expired);
        await db.SaveChangesAsync();
        return Ok(new { message = "Expired tokens removed." });
    }
}
