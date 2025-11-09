using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinServe.Core.Entities;
using FinServe.Core.Interfaces;
using FinServe.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinServe.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AlertsController(AppDbContext db) { _db = db; }

    // GET api/alerts/my
    [HttpGet("my")]
    public async Task<IActionResult> MyAlerts()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

        if (!int.TryParse(userIdClaim, out var userId)) return Unauthorized();

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
        if (alert == null) return NotFound();
        // ensure user owns it or is admin
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (!int.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        if (alert.UserId != userId && !isAdmin) return Forbid();

        alert.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Marked read" });
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
