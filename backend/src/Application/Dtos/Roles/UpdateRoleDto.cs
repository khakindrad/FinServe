namespace Application.Dtos.Roles;

public sealed record UpdateRoleDto(string Name, string Description, bool IsActive, List<string>? Menus);
