using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class AlertsController: BaseController
{
    private readonly AppDbContext _db;
    public AlertsController(ILogger logger, AppDbContext db) :
        base(logger.ForContext<AlertsController>())
    {
        _db = db;
    }

    // GET api/alerts/my
    [HttpGet("my")]
    public async Task<IActionResult> MyAlerts()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized("User details not valid.");

        var alerts = await _db.DashboardAlerts
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new { a.Id, a.Title, a.Message, a.IsRead, a.CreatedAt })
            .ToListAsync();

        return Ok(alerts);
    }

    // PUT api/alerts/markread/{id}
    [HttpPut("markread/{id}")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var alert = await _db.DashboardAlerts.FindAsync(id);
        if (alert == null) 
            return NotFound("No alerts found.");

        // ensure user owns it or is admin
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized("User details not valid.");

        var isAdmin = User.IsInRole("Admin");
        if (alert.UserId != userId && !isAdmin) 
            return Forbid("Not permited.");

        alert.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok("Marked read.");
    }

    // Admin: get all pending alerts (optional)
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> All()
    {
        var list = await _db.DashboardAlerts
            .OrderByDescending(a => a.CreatedAt)
            .Take(200)
            .Select(a => new { a.Id, a.UserId, a.Title, a.Message, a.IsRead, a.CreatedAt })
            .ToListAsync();
        return Ok(list);
    }
}
