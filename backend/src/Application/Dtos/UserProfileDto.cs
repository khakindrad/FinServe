using System;

namespace Application.Dtos;

// =========================
// DTO for Viewing Profile
// =========================
public class UserProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }

    // Location Information
    public int? CountryId { get; set; }
    public string? CountryName { get; set; }

    public int? StateId { get; set; }
    public string? StateName { get; set; }

    public int? CityId { get; set; }
    public string? CityName { get; set; }

    // Role Information
    public string RoleName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
