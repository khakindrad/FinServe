using Application.Dtos.Roles;
using Application.Dtos.Users;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : BaseController
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _db;
    private readonly IEmailSender _email;
    private readonly IUserRoleService _userRoleService;
    public AdminController(IUserRepository users, AppDbContext db, IEmailSender email, ILogger logger
        , IUserRoleService userRoleService)
        : base(logger.ForContext<AdminController>())
    {
        _users = users;
        _db = db;
        _email = email;
        _userRoleService = userRoleService;
    }

    [HttpGet("pending-users")]
    public async Task<IActionResult> GetPendingUsers()
    {
        var users = await _users.GetPendingApprovalsAsync().ConfigureAwait(false);

        if (users?.Count() > 0)
        {
            var userDtos = users.Select(u => new PendingUserDto(u.Id, u.Email, u.FullName, u.UserRoles?.Select(r => r.Role.Name).ToList(), u.CreatedTime)).ToList();

            return Ok(userDtos);
        }
        else
        {
            return Ok("No pending users found!");
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var allUsers = await _users.GetUsersAsync().ConfigureAwait(false);

        if (allUsers?.Count() > 0)
        {
            return Ok(
                allUsers.Select(u => new
               UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Mobile = u.Mobile,
                    Gender = u.Gender,
                    FullName = u.FullName,
                    DateOfBirth = u.DateOfBirth,
                    UserRoles = u.UserRoles.Select(r => r.Role.Name)?.ToList(),
                    Country = u.Country.Name,
                    City = u.City.Name,
                    State = u.State.Name,
                    Address = u.Address,
                    PinCode = u.PinCode,
                    IsActive = u.IsActive,
                    IsApproved = u.IsApproved,
                    EmailVerified = u.EmailVerified,
                    MobileVerified = u.MobileVerified,
                    PasswordLastChanged = u.PasswordLastChanged,
                    PasswordExpiryDate = u.PasswordExpiryDate,
                    FailedLoginCount = u.FailedLoginCount,
                    LockoutEndAt = u.LockoutEndAt,
                    MfaEnabled = u.MfaEnabled,
                    ProfileImageUrl = u.ProfileImageUrl,
                    CreatedAt = u.CreatedTime,
                    UpdatedAt = u.LastUpdatedTime,
                })
                );
        }
        else
        {
            return Ok("No users found!");
        }
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _userRoleService.GetAllRolesAsync().ConfigureAwait(false);

        if (roles?.Count > 0)
        {
            return Ok(roles.Select(r =>
            new RoleDto(r.Id, r.Name, r.Description, [.. r.RoleMenus.Select(rm => rm.MenuMaster.Name)])));
        }
        else
        {
            return Ok("No roles found!");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserRoles(int userId)
    {
        var userRoles = await _userRoleService.GetUserRolesAsync(userId).ConfigureAwait(false);

        if (userRoles?.Count > 0)
        {
            return Ok(userRoles
                .Select(ur =>
                new RoleDto(ur.Id, ur.Name, ur.Description, [.. ur.RoleMenus.Select(rm => rm.MenuMaster.Name)])));
        }
        else
        {
            return Ok("No roles are assigned to this user!");
        }
    }

    [HttpPost("assign/{userId}")]
    public async Task<IActionResult> AssignRoles(int userId, [FromBody] AssignRoleDto dto)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);

        if (user == null)
            return NotFound("User not found.");

        await _userRoleService.AssignRolesAsync(userId, dto.RoleIds).ConfigureAwait(false);

        return Ok("Roles assigned successfully.");
    }

    /// <summary>
    /// Unlock a user account (clear lockout and reset failed attempts).
    /// Only Admin can call.
    /// </summary>
    [HttpPatch("unlock/{userId}")]
    public async Task<IActionResult> UnlockUser(int userId)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        // Update fields
        user.LockoutEndAt = null;
        user.FailedLoginCount = 0;

        await _users.SaveChangesAsync().ConfigureAwait(false);

        // Record in LoginHistory (audit)
        try
        {
            // Create a login history entry if the table exists in your DbContext
            var history = new LoginHistory
            {
                UserId = user.Id,
                Email = user.Email,
                LoginTime = null,
                LogoutTime = null,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                Device = Request.Headers["User-Agent"].ToString(),
                Status = Status.SUCCESS,
                Message = "Account unlocked by admin"
            };
            _db.LoginHistory.Add(history);
            await _db.SaveChangesAsync().ConfigureAwait(false);
        }
        catch (Exception hx)
        {
            // non-fatal - log and continue
            Logger.Warning(hx, "Failed to write login history for unlock operation on user {UserId}", userId);
        }

        // Send email notification (best-effort)
        try
        {
            string emailBody = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Your account was unlocked by an administrator. You can attempt login now.
           </a>
        </p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

            await _email.SendEmailAsync(user.Email, "Your account has been unlocked", emailBody).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            Logger.Warning(ex, "Failed to send unlock email to {Email}", user.Email);
        }

        // Create dashboard alert (best-effort) if DashboardAlerts DbSet exists
        try
        {
            var alert = new DashboardAlert
            {
                UserId = user.Id,
                Title = "Account Unlocked",
                Message = "Your account has been unlocked by an administrator. Please login and verify.",
                IsRead = false,
                CreatedTime = DateTime.UtcNow
            };
            _db.DashboardAlerts.Add(alert);
            await _db.SaveChangesAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            Logger.Debug(ex, "Dashboard alert create failed for user {UserId}", userId);
        }

        Logger.Information("Admin {AdminEmail} unlocked user {UserEmail} (id:{UserId})", User.Identity?.Name ?? "unknown", user.Email, user.Id);

        return Ok("User unlocked successfully.");
    }

    [HttpDelete("cleanup-reset-tokens")]
    public async Task<IActionResult> Cleanup([FromServices] AppDbContext db)
    {
        var expired = db.PasswordResetTokens.Where(t => t.ExpiresAt < DateTime.UtcNow);
        db.PasswordResetTokens.RemoveRange(expired);
        await db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Expired tokens removed.");
    }

    [HttpPatch("approve/{userId}")]
    public async Task<IActionResult> ApproveUser(int userId)
    {
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);
        if (user == null)
            return NotFound("User not found.");

        user.IsApproved = true;
        await _users.SaveChangesAsync().ConfigureAwait(false);

        string emailBody = $@"
        <p>Hello <strong>{user.FullName}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              Your account is approved by admin.
           </a>
        </p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
        ";

        await _email.SendEmailAsync(user.Email, "Account approved", emailBody).ConfigureAwait(false);

        return Ok("Approved.");
    }
}
