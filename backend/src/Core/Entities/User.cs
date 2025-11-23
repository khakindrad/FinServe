namespace Core.Entities;

public sealed class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Mobile { get; set; }
    public required Gender Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public string FullName => $"{FirstName} {(string.IsNullOrEmpty(MiddleName) ? "" : MiddleName + " ")}{LastName}";
    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
    public required int CountryId { get; set; }
    public required int CityId { get; set; }
    public required int StateId { get; set; }
    public required string Address { get; set; }
    public required string PinCode { get; set; }
    public Country? Country { get; set; }
    public State? State { get; set; }
    public City? City { get; set; }
    public string? ProfileImageUrl { get; set; }
    // FIXED: EF Core navigation property must be ICollection<>, not List<>
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; }
    public bool EmailVerified { get; set; }
    public bool MobileVerified { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime PasswordLastChanged { get; set; } = DateTime.UtcNow;
    public DateTime? PasswordExpiryDate { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime? LockoutEndAt { get; set; }
    public bool MfaEnabled { get; set; }
    public string? MfaSecret { get; set; }
    public string? DeviceTokensJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}