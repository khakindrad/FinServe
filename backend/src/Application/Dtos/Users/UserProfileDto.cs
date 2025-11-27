namespace Application.Dtos.Users;

// =========================
// DTO for Viewing Profile
// =========================
public record UserProfileDto(int Id, string Email, string FirstName, string? MiddleName, string LastName, string Mobile, string Address, string? ProfileImageUrl, int? CountryId, string? CountryName, int? StateId, string? StateName, int? CityId, string? CityName, string RoleName, DateTime CreatedAt, DateTime? UpdatedAt);
