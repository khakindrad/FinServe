namespace Application.Dtos;

public class AssignRoleDto
{
    public int UserId { get; set; }
    public List<int> RoleIds { get; set; } = new();
}