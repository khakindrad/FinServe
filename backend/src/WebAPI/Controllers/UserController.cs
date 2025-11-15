using Application.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserRepository users, ILogger<UserController> logger)
    {
        _users = users;
        _logger = logger;
    }

    // =======================
    // GET /api/user/profile
    // =======================
    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _users.GetByIdAsync(userId);

        if (user == null)
            return NotFound(new { message = "User not found" });

        var profile = new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            Mobile = user.Mobile,
            Address = user.Address,
            ProfileImageUrl = user.ProfileImageUrl,
            CountryId = user.CountryId,
            CountryName = user.Country?.Name,
            StateId = user.StateId,
            StateName = user.State?.Name,
            CityId = user.CityId,
            CityName = user.City?.Name,
            //RoleName = user.UserRoles.Name,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        _logger.LogInformation("Profile viewed by user {UserId}", userId);
        return Ok(profile);
    }

    // =======================
    // PUT /api/user/profile
    // =======================
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _users.GetByIdAsync(userId);

        if (user == null)
            return NotFound(new { message = "User not found" });

        // Basic info
        user.FirstName = dto.FirstName;
        user.MiddleName = dto.MiddleName;
        user.LastName = dto.LastName;
        user.Mobile = dto.Mobile;
        user.Address = dto.Address;
        user.ProfileImageUrl = dto.ProfileImageUrl;

        // Location info
        user.CountryId = dto.CountryId;
        user.StateId = dto.StateId;
        user.CityId = dto.CityId;

        user.UpdatedAt = DateTime.UtcNow;

        await _users.UpdateAsync(user);
        await _users.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated profile successfully", userId);

        return Ok(new { message = "Profile updated successfully" });
    }

    // Helper method
    private int GetCurrentUserId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}
