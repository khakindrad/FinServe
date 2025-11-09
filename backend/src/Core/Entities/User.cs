namespace Core.Entities;
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; }
    public string FullName { get; set; } = string.Empty;
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
}
