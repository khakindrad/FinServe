namespace Application.Dtos.Roles;

public sealed record RoleDto(int Id, string Name, string Description, List<string>? Menus);
