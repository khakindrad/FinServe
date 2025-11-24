using Core.Entities;

namespace Application.Dtos;

public sealed class UserDto
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Mobile { get; set; }
    public required Gender Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public required string FullName { get; set; }
    public required string Country { get; set; }
    public required string State { get; set; }
    public required string City { get; set; }
    public required string Address { get; set; }
    public required string PinCode { get; set; }    
    public string? ProfileImageUrl { get; set; }
    public ICollection<string> UserRoles { get; set; } = [];
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public bool EmailVerified { get; set; }
    public bool MobileVerified { get; set; }
    public DateTime PasswordLastChanged { get; set; }
    public DateTime? PasswordExpiryDate { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime? LockoutEndAt { get; set; }
    public bool MfaEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
