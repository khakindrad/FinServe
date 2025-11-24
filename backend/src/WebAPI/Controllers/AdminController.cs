using Application.Dtos;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace WebAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : BaseController
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _db;
    private readonly EmailService _email;
    private readonly Serilog.ILogger _logger;
    private readonly IUserRoleService _userRoleService;
    public AdminController(IUserRepository users, AppDbContext db, EmailService email, Serilog.ILogger logger
        , IUserRoleService userRoleService)
    {
        _users = users;
        _db = db;
        _email = email;
        _logger = logger.ForContext<AdminController>();
        _userRoleService = userRoleService;
    }

    [HttpGet("pending-users")]
    public async Task<IActionResult> GetPendingUsers()
    {
        var users = await _users.GetPendingApprovalsAsync();

        if (users?.Count() > 0)
        {
            var userDtos = users.Select(u => new PendingUserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                CreatedAt = u.CreatedAt,
                UserRoles = u.UserRoles?.Select(r => r.Role.Name).ToList()
            }).ToList();

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
        var allUsers = await _users.GetUsersAsync();

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
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
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
        var roles = await _userRoleService.GetAllRolesAsync();

        if (roles?.Count > 0)
        {
            return Ok(roles.Select(r =>
            new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Menus = r.RoleMenus.Select(rm => rm.MenuMaster.Name).ToList()
            }));
        }
        else
        {
            return Ok("No roles found!");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserRoles(int userId)
    {
        var userRoles = await _userRoleService.GetUserRolesAsync(userId);

        if (userRoles?.Count > 0)
        {
            return Ok(userRoles
                .Select(ur =>
                new RoleDto
                {
                    Id = ur.Id,
                    Name = ur.Name,
                    Menus = ur.RoleMenus.Select(rm => rm.MenuMaster.Name).ToList()
                }));
        }
        else
        {
            return Ok("No roles are assigned to this user!");
        }
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignRoles([FromBody] AssignRoleDto dto)
    {
        await _userRoleService.AssignRolesAsync(dto.UserId, dto.RoleIds);

        return Ok("Roles assigned successfully.");
    }

    /// <summary>
    /// Unlock a user account (clear lockout and reset failed attempts).
    /// Only Admin can call.
    /// </summary>
    /// <param name="userId">User id to unlock</param>
    /// <param name="body">Optional: { "reactivate": true } to set IsActive = true</param>
    [HttpPut("unlock/{userId}")]
    public async Task<IActionResult> UnlockUser(int userId, [FromBody] dynamic? body = null)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        // Update fields
        user.LockoutEndAt = null;
        user.FailedLoginCount = 0;

        if (body != null && (body.reactivate != null && (bool)body.reactivate))
        {
            user.IsActive = true;
        }

        await _users.UpdateAsync(user);
        await _users.SaveChangesAsync();

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
                Status = "SUCCESS",
                Message = "Account unlocked by admin"
            };
            _db.LoginHistory.Add(history);
            await _db.SaveChangesAsync();
        }
        catch (Exception hx)
        {
            // non-fatal - log and continue
            _logger.Warning(hx, "Failed to write login history for unlock operation on user {UserId}", userId);
        }

        // Send email notification (best-effort)
        try
        {
            await _email.SendEmailAsync(user.Email, "Your account has been unlocked",
                $"Hello {user.FullName},<br/><br/>Your account was unlocked by an administrator. You can attempt login now.");
        }
        catch (Exception ex)
        {
            _logger.Warning(ex, "Failed to send unlock email to {Email}", user.Email);
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
                CreatedAt = DateTime.UtcNow
            };
            _db.DashboardAlerts.Add(alert);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.Debug(ex, "Dashboard alert create failed for user {UserId}", userId);
        }

        _logger.Information("Admin {AdminEmail} unlocked user {UserEmail} (id:{UserId})", User.Identity?.Name ?? "unknown", user.Email, user.Id);

        return Ok("User unlocked successfully.");
    }

    [HttpDelete("cleanup-reset-tokens")]
    public async Task<IActionResult> Cleanup([FromServices] AppDbContext db)
    {
        var expired = db.PasswordResetTokens.Where(t => t.ExpiresAt < DateTime.UtcNow);
        db.PasswordResetTokens.RemoveRange(expired);
        await db.SaveChangesAsync();

        return Ok("Expired tokens removed.");
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> ApproveUser(int id)
    {
        var user = await _users.GetByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.IsApproved = true;
        await _users.UpdateAsync(user);
        await _users.SaveChangesAsync();
        await _email.SendEmailAsync(user.Email, "Account approved", "Your account is approved by admin.");

        return Ok("Approved.");
    }
}
