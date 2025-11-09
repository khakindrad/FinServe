using FinServe.Core.Entities;
using FinServe.Core.Interfaces;
using FinServe.Infrastructure.Data;
using FinServe.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace FinServe.WebAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _db;
    private readonly EmailService _email;
    private readonly ILogger<AdminController> _logger;
    public AdminController(IUserRepository users, AppDbContext db, EmailService email, ILogger<AdminController> logger)
    {
        _users = users;
        _db = db;
        _email = email;
        _logger = logger;
    }

    [HttpGet("pending-users")]
    public async Task<IActionResult> GetPending()
    {
        var items = await _users.GetPendingApprovalsAsync();
        return Ok(items.Select(u => new { u.Id, u.Email, u.FullName, role = u.Role?.Name }));
    }

    [HttpPut("assign-role/{userId}/{roleId}")]
    public async Task<IActionResult> AssignRole(int userId, int roleId)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null) return NotFound();
        user.RoleId = roleId;
        await _users.UpdateAsync(user);
        await _users.SaveChangesAsync();
        return Ok(new { message = "Role assigned" });
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
            return NotFound(new { message = "User not found" });

        // Update fields
        user.LockoutEndAt = null;
        user.FailedLoginCount = 0;

        if (body != null && ((body.reactivate != null && (bool)body.reactivate)))
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
            _logger.LogWarning(hx, "Failed to write login history for unlock operation on user {UserId}", userId);
        }

        // Send email notification (best-effort)
        try
        {
            await _email.SendEmailAsync(user.Email, "Your account has been unlocked",
                $"Hello {user.FullName},<br/><br/>Your account was unlocked by an administrator. You can attempt login now.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send unlock email to {Email}", user.Email);
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
            _logger.LogDebug(ex, "Dashboard alert create failed for user {UserId}", userId);
        }

        Log.Information("Admin {AdminEmail} unlocked user {UserEmail} (id:{UserId})", User.Identity?.Name ?? "unknown", user.Email, user.Id);

        return Ok(new { message = "User unlocked successfully" });
    }
}
