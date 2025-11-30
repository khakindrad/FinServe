using Application.Dtos.Users;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class UserController : BaseController
{
    private readonly IUserRepository _users;

    public UserController(ILogger logger, IUserRepository users)
        : base(logger.ForContext<UserController>())
    {
        _users = users;
    }

    // =======================
    // GET /api/user/profile
    // =======================
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);

        if (user == null)
            return NotFound("User not found.");

        var profile = new UserProfileDto(user.Id,user.Email,user.FirstName,user.MiddleName,user.LastName,user.Mobile,user.Address,user.ProfileImageUrl,user.CountryId,user.Country?.Name,
            user.StateId,user.State?.Name,user.CityId,user.City?.Name,default,user.CreatedTime,user.LastUpdatedTime);

        Logger.Information("Profile viewed by user {UserId}", userId);
        return Ok(profile);
    }

    // =======================
    // PUT /api/user/profile
    // =======================
    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _users.GetByIdAsync(userId).ConfigureAwait(false);

        if (user == null)
            return NotFound("User not found.");

        // Basic info
        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.MiddleName is not null) user.MiddleName = dto.MiddleName;
        if (dto.LastName is not null) user.LastName = dto.LastName;
        if (dto.Mobile is not null) user.Mobile = dto.Mobile;
        if (dto.Address is not null) user.Address = dto.Address;
        if (dto.ProfileImageUrl is not null) user.ProfileImageUrl = dto.ProfileImageUrl;

        // Location info
        if (dto.CountryId is not null) user.CountryId = dto.CountryId.Value;
        if (dto.StateId is not null) user.StateId = dto.StateId.Value;
        if (dto.CityId is not null) user.CityId = dto.CityId.Value;

        user.LastUpdatedTime = DateTime.UtcNow;

        await _users.SaveChangesAsync().ConfigureAwait(false);

        Logger.Information("User {UserId} updated profile successfully", userId);

        return Ok("Profile updated successfully.");
    }

    // Helper method
    private int GetCurrentUserId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}
