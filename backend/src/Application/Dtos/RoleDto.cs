namespace Application.Dtos;

public sealed class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<MenuDto>? Menus { get; set; }
}