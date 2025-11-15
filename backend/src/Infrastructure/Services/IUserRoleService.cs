using Core.Entities;

namespace Infrastructure.Services;

public interface IUserRoleService
{
    Task<List<Role>> GetAllRolesAsync();
    Task<List<Role>> GetUserRolesAsync(int userId);
    Task AssignRolesAsync(int userId, List<int> roleIds);
}