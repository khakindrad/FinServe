using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinServe.Core.Interfaces;

namespace FinServe.WebAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _users;
    public AdminController(IUserRepository users) { _users = users; }

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
}
