using Application.Dtos;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly AppDbContext _db;
    private readonly IUserRepository _users;
    private readonly RefreshTokenService _rtService;
    private readonly EmailService _email;
    private readonly MfaService _mfa;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserRepository users, RefreshTokenService rtService, EmailService email, MfaService mfa, IConfiguration config, ILogger<AuthController> logger, AppDbContext db)
    {
        _users = users; _rtService = rtService; _email = email; _mfa = mfa; _config = config; _logger = logger;
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password)) 
            return BadRequest("Email/password required");

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();
        var (valid, message) = policy.ValidatePassword(dto.Password);
        if (!valid)
            return BadRequest(new { message });

        var existing = await _users.GetByEmailAsync(dto.Email);

        if (existing != null) 
            return BadRequest("Email exists");

        var user = new User
        {
            Email = dto.Email,
            Mobile = dto.Mobile,
            Gender = dto.Gender,
            DateOfBirth = dto.DateOfBirth,
            FirstName = dto.FirstName,
            MiddleName = dto.MiddleName,
            LastName = dto.LastName,
            CountryId = dto.CountryId,
            CityId = dto.CityId,
            StateId = dto.StateId,
            Address = dto.Address,
            PinCode = dto.PinCode,
            IsActive = true,
            IsApproved = false,
            PasswordHash = HashPassword(dto.Password),
            PasswordLastChanged = DateTime.UtcNow,
            PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90))
        };

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();
        await historyService.AddToHistoryAsync(user);

        var token = GenerateToken();

        var expiryHours = _config.GetValue("Smtp:VerificationExpiryHours", 24);

        var record = new EmailVerificationToken
        {
            Email = dto.Email,
            Token = token,
            ExpiryTime = DateTime.UtcNow.AddHours(expiryHours),
            IsUsed = false
        };

        _db.EmailVerificationTokens.Add(record);
        await _db.SaveChangesAsync();

        string verificationUrl = $"{Request.Scheme}://{Request.Host}/api/auth/verify-email?email={dto.Email}&token={token}";

        string body = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p>Please click the button below to verify your account:</p>
        <p><a href='{verificationUrl}' 
              style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Verify Email
           </a>
        </p>
        <p>This link will expire in {expiryHours} hour.</p>;
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Verify your account - FinServe", body);

        var adminEmail = _config["Admin:NotificationEmail"];
        if (!string.IsNullOrEmpty(adminEmail)) 
            await _email.SendEmailAsync(adminEmail, "New user pending approval", $"User {user.Email} registered. Id:{user.Id}");

        return Ok(new { message = "Registered. Verify email & mobile and wait for admin approval.", userId = user.Id });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
    {
        var record = await _db.EmailVerificationTokens
            .Where(x => x.Email == email && x.Token == token && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (record == null)
            return BadRequest("Invalid or already used token.");

        if (record.ExpiryTime < DateTime.UtcNow)
            return BadRequest("Verification link expired.");

        record.IsUsed = true;
        await _db.SaveChangesAsync();

        // Mark user verified
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            user.EmailVerified = true;
            await _db.SaveChangesAsync();
        }

        return Ok("Email verified successfully!");
    }

    [HttpPost("verify-mobile")] 
    public async Task<IActionResult> VerifyMobile([FromBody] VerifyMobileDto verifyMobileDto) 
    { 
        int userId = verifyMobileDto.UserId; 
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

        return Ok(new { accessToken, refreshToken = refresh.Token, user =
            new { user.Id, user.Email, user.FullName, role = user.UserRoles } });
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

    private static string GenerateToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                      .Replace("/", "-")
                      .Replace("+", "_");
    }

    private string GenerateJwt(User user)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ReplaceWithStrongKey");
        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        // 3. Get roles
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        var claims = new List<Claim>
        { 
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName), 
            //new Claim(ClaimTypes.Role, user.UserRoles?.Name ?? "Customer") 
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
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
