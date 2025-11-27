namespace Core.Entities;

// Entities/UserRole.cs
public sealed class UserRole : BaseEntity
{
    public required int UserId { get; set; }
    public User User { get; set; } = null!;
    public required int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
