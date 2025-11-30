namespace Application.Dtos.Users;

// =========================
// DTO for Updating Profile
// =========================
public sealed record UpdateUserProfileDto(string? FirstName, string? MiddleName, string? LastName, string? Mobile, string? Address, string? ProfileImageUrl, int? CountryId, int? StateId, int? CityId);
