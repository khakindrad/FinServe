using System;

namespace Core.Entities;
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; }
    public string FullName => $"{FirstName} {(string.IsNullOrEmpty(MiddleName) ? "" : MiddleName + " ")}{LastName}";
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int? CityId { get; set; }
    public int? StateId { get; set; }
    public int? CountryId { get; set; }
    public Country? Country { get; set; }
    public State? State { get; set; }
    public City? City { get; set; }
    public string? ProfileImageUrl { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;
    public bool EmailVerified { get; set; } = false;
    public bool MobileVerified { get; set; } = false;
    public string PasswordHash { get; set; } = string.Empty;
    public System.DateTime PasswordLastChanged { get; set; } = System.DateTime.UtcNow;
    public System.DateTime? PasswordExpiryDate { get; set; }
    public int FailedLoginCount { get; set; } = 0;
    public System.DateTime? LockoutEndAt { get; set; }
    public bool MfaEnabled { get; set; } = false;
    public string MfaSecret { get; set; }
    public string DeviceTokensJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
