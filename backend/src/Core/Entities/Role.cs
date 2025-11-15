namespace Core.Entities;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<RoleMenu> RoleMenus { get; set; } = new();
}
