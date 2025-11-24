namespace Application.Dtos;

public sealed class RoleDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }

    public required List<string>? Menus { get; set; }
}