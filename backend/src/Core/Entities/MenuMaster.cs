namespace Core.Entities;

// Entities/Menu.cs
public class MenuMaster
{
    public int MenuId { get; set; }
    public string Name { get; set; } = null!;
    public string? Route { get; set; }
    public string? Icon { get; set; }
    public int? ParentId { get; set; }
    public int Sequence { get; set; }
    public bool IsActive { get; set; } = true;
    public List<MenuMaster> Children { get; set; } = new();
}
