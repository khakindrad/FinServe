namespace Core.Entities;

// Entities/Menu.cs
public sealed class MenuMaster : BaseEntity
{
    public required string Name { get; set; }
    public string? Route { get; set; }
    public string? Icon { get; set; }
    public int? ParentId { get; set; }
    public int Sequence { get; set; }
    public bool IsActive { get; set; } = true;
    public MenuMaster? Parent { get; set; }
    public List<MenuMaster> Children { get; set; } = [];
    public ICollection<RoleMenu> RoleMenus { get; set; }
}
