namespace Core.Entities;

// Entities/RoleMenu.cs
public class RoleMenu
{
    public int RoleMenuId { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public int MenuId { get; set; }
    public MenuMaster MenuMaster { get; set; } = null!;
}