namespace Application.Dtos;

// =========================
// DTO for Updating Profile
// =========================
public class UpdateUserProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }

    // Location fields (can be null)
    public int? CountryId { get; set; }
    public int? StateId { get; set; }
    public int? CityId { get; set; }
}