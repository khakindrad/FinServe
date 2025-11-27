namespace Core.Entities;

public sealed class Role : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required bool IsActive { get; set; } = true;
    public List<UserRole> UserRoles { get; set; }
    public List<RoleMenu> RoleMenus { get; set; }
}
