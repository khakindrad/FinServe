namespace Application.Dtos.Roles;

public record AssignRoleDto(int UserId, List<int> RoleIds);
