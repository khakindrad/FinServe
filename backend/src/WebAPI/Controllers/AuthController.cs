using Application.Dtos.Auth;
using Application.Dtos.Menus;
using Application.Dtos.Users;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : BaseController
{
    private readonly AppDbContext _db;
    private readonly IUserRepository _users;
    private readonly RefreshTokenService _rtService;
    private readonly IEmailSender _email;
    private readonly IMobileVerificationService _mobileVerificationService;
    private readonly MfaService _mfa;
    private readonly IConfiguration _config;

    public AuthController(IUserRepository users, IMobileVerificationService mobileVerificationService, RefreshTokenService rtService, IEmailSender email, MfaService mfa, IConfiguration config, ILogger logger, AppDbContext db)
        : base(logger.ForContext<AuthController>())
    {
        _users = users; _rtService = rtService; _email = email; _mfa = mfa; _config = config;
        _db = db;
        _mobileVerificationService = mobileVerificationService;
    }


    #region Private Methods
    private async Task<IActionResult> SendVerificationEmail(User user)
    {
        if (user.EmailVerified)
            return BadRequest("Email already verified.");

        var token = GenerateToken();

        var expiryHours = _config.GetValue("Smtp:VerificationExpiryHours", 24);

        var record = new EmailVerificationToken
        {
            Email = user.Email,
            Token = token,
            ExpiryTime = DateTime.UtcNow.AddHours(expiryHours),
            IsUsed = false
        };

        _db.EmailVerificationTokens.Add(record);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        string verificationUrl = $"{Request.Scheme}://{Request.Host}/api/auth/verify-email?email={user.Email}&token={token}";

        string body = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p>Please click the button below to verify your account:</p>
        <p><a href='{verificationUrl}' 
              style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Verify Email
           </a>
        </p>
        <p>This link will expire in {expiryHours} hour.</p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Verify your account - FinServe", body).ConfigureAwait(false);

        return Ok();
    }
    private static string GenerateToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                      .Replace("/", "-")
                      .Replace("+", "_");
    }

    private string GenerateJwt(User user)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        // 3. Get roles
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim("UserId", user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName), 
            //new Claim(ClaimTypes.Role, user.UserRoles?.Name ?? "Customer") 
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        var token = new JwtSecurityToken(issuer: _config["Jwt:Issuer"], audience: _config["Jwt:Audience"], claims: claims, expires: DateTime.UtcNow.AddMinutes(_config.GetValue("Jwt:ExpiryMinutes", 15)), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<List<MenuTreeDto>> GetUserMenus(int userId)
    {
        //1 CHECK IF USER IS ADMIN
        bool isAdmin = await _db.UserRoles
        .Include(ur => ur.Role)
        .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "Admin").ConfigureAwait(false);

        List<MenuMaster> efMenus;

        //2 IF ADMIN --> RETURN ALL MENUS
        if (isAdmin)
        {
            efMenus = await _db.MenuMaster
                .Include(m => m.Parent)
                .OrderBy(m => m.ParentId)
                .ThenBy(m => m.Sequence)
                .ToListAsync().ConfigureAwait(false);
        }
        //3 IF NOT ADMIN --> RETURN ROLE BASED MENUS
        else
        {
            efMenus = await _db.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
                .ThenInclude(r => r.RoleMenus)
                    .ThenInclude(rm => rm.MenuMaster)
                        .ThenInclude(m => m.Parent)
            .SelectMany(ur => ur.Role.RoleMenus.Select(rm => rm.MenuMaster))
            .Distinct()
            .OrderBy(m => m.ParentId)
            .ThenBy(m => m.Sequence)
            .ToListAsync().ConfigureAwait(false);
        }

        //4 CONVERT TO TREE
        var menuTree = BuildMenuTree(efMenus);
        return menuTree;
    }

    private List<MenuTreeDto> BuildMenuTree(List<MenuMaster> menus)
    {
        var lookup = menus.ToDictionary(m => m.Id, m => new MenuTreeDto(m.Id, m.Name, m.Route ?? "", m.Icon ?? "", m.Sequence)
        {
            Id = m.Id,
            Name = m.Name,
            Route = m.Route ?? "",
            Icon = m.Icon ?? "",
            Order = m.Sequence
        });

        List<MenuTreeDto> roots = new();

        foreach (var menu in menus)
        {
            if (menu.ParentId == null)
            {
                // Root menu
                roots.Add(lookup[menu.Id]);
            }
            else if (lookup.ContainsKey(menu.ParentId.Value))
            {
                // Child menu
                lookup[menu.ParentId.Value].Children.Add(lookup[menu.Id]);
            }
        }

        // Sort children
        foreach (var item in lookup.Values)
        {
            item.Children = [.. item.Children.OrderBy(c => c.Order)];
        }

        // Sort roots
        return [.. roots.OrderBy(r => r.Order)];
    }
    #endregion

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email/password required");

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();
        var (valid, message) = policy.ValidatePassword(dto.Password);
        if (!valid)
            return BadRequest(message);

        var existing = await _users.GetByEmailAsync(dto.Email).ConfigureAwait(false);

        if (existing != null)
            return BadRequest("Email already exists");

        var hasher = new PasswordHasher<User>();

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
            PasswordHash = string.Empty,
            PasswordLastChanged = DateTime.UtcNow,
            PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90))
        };

        user.PasswordHash = hasher.HashPassword(user, dto.Password);

        await _users.AddAsync(user).ConfigureAwait(false);
        await _users.SaveChangesAsync().ConfigureAwait(false);

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();
        await historyService.AddToHistoryAsync(user).ConfigureAwait(false);

        var emailSendResult = await SendVerificationEmail(user).ConfigureAwait(false);

        if (emailSendResult is OkResult)
        {
            Logger.Information("Verification email sent to {Email}", dto.Email);
        }
        else
        {
            Logger.Warning("Failed to send verification email to {Email}", dto.Email);

            return emailSendResult;
        }

        var adminEmail = _config["Admin:NotificationEmail"];
        if (!string.IsNullOrEmpty(adminEmail))
        {
            string emailBody = $@"
        <p>Hello <strong>Admin User</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              User {user.FullName} email {user.Email} registered. Id:{user.Id}
           </a>
        </p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

            await _email.SendEmailAsync(adminEmail, "New user pending approval", emailBody).ConfigureAwait(false);
        }

        var registerResponseDto = new RegisterResponseDto(dto.Email, dto.Mobile, dto.Gender, dto.DateOfBirth, dto.FirstName, dto.MiddleName, dto.LastName, dto.CountryId, dto.CityId, dto.StateId, dto.Address, dto.PinCode);

        return Created(registerResponseDto, "Registered. Verify email & mobile and wait for admin approval.");
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
    {
        var record = await _db.EmailVerificationTokens
            .Where(x => x.Email == email && x.Token == token && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync().ConfigureAwait(false);

        if (record == null)
            return BadRequest("Invalid or already used token.");

        if (record.ExpiryTime < DateTime.UtcNow)
            return BadRequest("Verification link expired.");

        record.IsUsed = true;
        await _db.SaveChangesAsync().ConfigureAwait(false);

        // Mark user verified
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email).ConfigureAwait(false);
        if (user != null)
        {
            user.EmailVerified = true;
            await _db.SaveChangesAsync().ConfigureAwait(false);
        }

        return Ok("Email verified successfully!");
    }

    [HttpPost("send-verification-email/{userId}")]
    public async Task<IActionResult> SendVerificationMail(int userId)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        var emailSendResult = await SendVerificationEmail(user).ConfigureAwait(false);

        if (emailSendResult is OkResult)
        {
            Logger.Information("Verification email sent to {Email}", user.Email);
            return Ok($"Verification email sent to {user.Email}");
        }
        else
        {
            Logger.Warning("Failed to send verification email to {Email}", user.Email);

            return emailSendResult;
        }
    }

    [HttpPatch("update-email/{userId}")]
    public async Task<IActionResult> UpdateEmail(int userId, [FromBody] UpdateEmailDto updateEmailDto)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);

        if (user == null)
            return NotFound("User not found.");

        var existing = await _users.GetByEmailAsync(updateEmailDto.NewEmail).ConfigureAwait(false);

        if (existing != null)
            return BadRequest("Email already exists");

        user.Email = updateEmailDto.NewEmail;

        user.EmailVerified = false;
        await _users.SaveChangesAsync().ConfigureAwait(false);

        var emailSendResult = await SendVerificationEmail(user).ConfigureAwait(false);

        if (emailSendResult is OkResult)
        {
            Logger.Information("Verification email sent to {Email}", user.Email);
            return Ok($"Verification email sent to {user.Email}");
        }
        else
        {
            Logger.Warning("Failed to send verification email to {Email}", user.Email);

            return emailSendResult;
        }
    }

    [HttpPatch("update-mobile/{userId}")]
    public async Task<IActionResult> UpdateMobile(int userId,[FromBody] UpdateMobileDto updateMobileDto)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        var existing = await _users.GetByMobileAsync(updateMobileDto.NewMobile).ConfigureAwait(false);

        if (existing != null)
            return BadRequest("Mobile No already exists");

        user.Mobile = updateMobileDto.NewMobile;

        user.MobileVerified = false;

        await _users.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Mobile Number updated successfully.");
    }

    [HttpPost("send-otp/{userId}")]
    public async Task<IActionResult> SendOtp(int userId)
    {
        var response = await _mobileVerificationService.SendOtpAsync(userId).ConfigureAwait(false);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("verify-otp/{userId}")]
    public async Task<IActionResult> VerifyOtp(int userId, [FromBody] VerifyOtpDto dto)
    {
        var response = await _mobileVerificationService.VerifyOtpAsync(userId, dto.Otp).ConfigureAwait(false);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        var responseDto = new LoginResponseUserDto(user.Id, user.FullName, user.Email, user.EmailVerified, user.MobileVerified, user.ProfileImageUrl,
            user.UserRoles.Select(r => r.Role.Name)?.ToList(), await GetUserMenus(user.Id).ConfigureAwait(false));

        if (!user.EmailVerified)
            return Forbid("Email must be verified.", responseDto);

        if (!user.MobileVerified)
            return Forbid("Mobile must be verified.", responseDto);

        if (!user.IsApproved)
            return Forbid("User not approved.", responseDto);

        if (user.LockoutEndAt.HasValue && user.LockoutEndAt.Value > DateTime.UtcNow)
            return Forbid($"Account locked, your account will be unlocked at {user.LockoutEndAt}.");

        var hasher = new PasswordHasher<User>();

        if (hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
        {
            user.FailedLoginCount++;
            if (user.FailedLoginCount >= _config.GetValue("Security:Lockout:MaxFailedAttempts", 5))
            {
                user.LockoutEndAt = DateTime.UtcNow.AddMinutes(_config.GetValue("Security:Lockout:LockoutMinutes", 15));
                user.FailedLoginCount = 0;
            }
            await _users.SaveChangesAsync().ConfigureAwait(false);
            return Unauthorized("Invalid credentials.");
        }

        user.FailedLoginCount = 0;
        await _users.SaveChangesAsync().ConfigureAwait(false);

        if (user.MfaEnabled)
        {
            if (string.IsNullOrEmpty(dto.TotpCode) || !_mfa.ValidateTotp(user.MfaSecret ?? string.Empty, dto.TotpCode))
                return Forbid("MFA required/invalid");
        }

        var accessToken = GenerateJwt(user);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        var refresh = await _rtService.CreateRefreshTokenAsync(user.Id, ip, days: 30).ConfigureAwait(false);

        //Correct cookie append
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // set to true if using HTTPS
            SameSite = SameSiteMode.None, // required for cross-origin cookies
            Expires = DateTime.UtcNow.AddDays(30),
            Path = "/" // optional, but ensures cookie is available to the whole app
        };
        // Use refresh.Token here
        Response.Cookies.Append("refreshToken", refresh.Token, cookieOptions);

        return Ok("Login successful.",
            new LoginResponseDto(accessToken, responseDto));
    }

    [HttpGet("refresh")]
    [Authorize]
    public async Task<IActionResult> Refresh()
    {
        string? refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("Refresh token missing.");

        var rt = await _rtService.GetValidRefreshTokenAsync(refreshToken).ConfigureAwait(false);

        if (rt == null)
            return Unauthorized("Invalid refresh token.");

        var newRt = await _rtService.CreateRefreshTokenAsync(rt.UserId, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown", 30).ConfigureAwait(false);

        await _rtService.RevokeAsync(rt, "rotated", newRt.Token).ConfigureAwait(false);

        var user = await _users.GetByIdAsync(rt.UserId).ConfigureAwait(false);

        if (user == null)
            return Unauthorized("User not found.");

        var accessToken = GenerateJwt(user);
        Response.Cookies.Append(
            "refreshToken",
            newRt.Token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,       // Use HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30),
                Path = "/api/auth/refresh"
            }
            );

        return Ok(new
        {
            accessToken
        });
    }

    [HttpGet("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["refreshToken"]; // read cookie
        if (!string.IsNullOrWhiteSpace(token))
        {
            var rt = await _rtService.GetValidRefreshTokenAsync(token).ConfigureAwait(false);

            if (rt != null)
                await _rtService.RevokeAsync(rt, "logout").ConfigureAwait(false);
        }
        // delete cookie
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });
        return Ok("Logged out.");
    }


    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto, [FromServices] PasswordResetService resetService)
    {
        var user = await _users.GetByEmailAsync(forgotPasswordDto.Email).ConfigureAwait(false);
        if (user == null)
        {
            // Return same message to prevent enumeration
            return Ok("If account exists, a reset link has been sent.");
        }

        var expiryHours = _config.GetValue("Smtp:VerificationExpiryHours", 24);

        var tokenEntity = await resetService.CreateTokenAsync(user.Id, (int)TimeSpan.FromHours(expiryHours).TotalMinutes).ConfigureAwait(false);

        var resetUrl = $"{forgotPasswordDto.RedirectUrl}/{Uri.EscapeDataString(tokenEntity.Token)}";

        string body = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p><a href='{resetUrl}' 
              style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Reset Password
           </a>
        </p>
        <p>This link will expire in {expiryHours} hour.</p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Password reset request", body).ConfigureAwait(false);

        return Ok("If account exists, a reset link has been sent.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto, [FromServices] PasswordResetService resetService)
    {
        var user = await resetService.ValidateTokenAsync(resetPasswordDto.Token).ConfigureAwait(false);
        if (user == null)
        {
            return BadRequest("Invalid or expired reset token.");
        }

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();

        var (valid, message) = policy.ValidatePassword(resetPasswordDto.NewPassword);

        if (!valid)
            return BadRequest(message);

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();

        if (await historyService.IsPasswordReusedAsync(user, resetPasswordDto.NewPassword).ConfigureAwait(false))
            return BadRequest("You cannot reuse any of your last passwords.");

        var hasher = new PasswordHasher<User>();

        user.PasswordHash = hasher.HashPassword(user, resetPasswordDto.NewPassword);
        user.PasswordLastChanged = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90));

        await _users.SaveChangesAsync().ConfigureAwait(false);
        await historyService.AddToHistoryAsync(user).ConfigureAwait(false);

        string body = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Your password has been reset successfully.
        </p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Password Reset Successful", body).ConfigureAwait(false);

        return Ok("Password reset successful.");
    }

    [HttpPost("change-password/{userId}")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordDto changePasswordDto)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        var hasher = new PasswordHasher<User>();

        // Verify old password
        var oldHash = Convert.FromBase64String(user.PasswordHash);

        if (hasher.VerifyHashedPassword(user, user.PasswordHash, changePasswordDto.OldPassword) == PasswordVerificationResult.Failed)
        {
            return BadRequest("Old password is incorrect.");
        }

        var policy = HttpContext.RequestServices.GetRequiredService<PasswordPolicyService>();

        var (valid, message) = policy.ValidatePassword(changePasswordDto.NewPassword);

        if (!valid)
            return BadRequest(message);

        var historyService = HttpContext.RequestServices.GetRequiredService<PasswordHistoryService>();

        if (await historyService.IsPasswordReusedAsync(user, changePasswordDto.NewPassword).ConfigureAwait(false))
            return BadRequest("You cannot reuse any of your last passwords.");

        user.PasswordHash = hasher.HashPassword(user, changePasswordDto.NewPassword);
        user.PasswordLastChanged = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_config.GetValue("Security:PasswordExpiryDays", 90));

        await _users.SaveChangesAsync().ConfigureAwait(false);
        await historyService.AddToHistoryAsync(user).ConfigureAwait(false);

        string body = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Your password has been Changed successfully.
        </p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Password Changed Successful", body).ConfigureAwait(false);

        return Ok("Password Changed successful.");
    }
}
