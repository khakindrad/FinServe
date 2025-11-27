namespace Core.Entities;

// Entities/RoleMenu.cs
public sealed class RoleMenu : BaseEntity
{
    public required int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public required int MenuId { get; set; }
    public MenuMaster MenuMaster { get; set; } = null!;
}