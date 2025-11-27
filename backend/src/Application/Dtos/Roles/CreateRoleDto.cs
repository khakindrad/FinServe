namespace Application.Dtos.Roles;

public sealed record CreateRoleDto(string Name, string Description, bool IsActive, List<string>? Menus);
