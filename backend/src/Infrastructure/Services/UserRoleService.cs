using Core.Entities;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

public class UserRoleService : IUserRoleService
{
    private readonly AppDbContext _db;

    public UserRoleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Role>> GetAllRolesAsync()
    {
        return await _db.Roles.AsNoTracking().ToListAsync();
    }

    public async Task<List<Role>> GetUserRolesAsync(int userId)
    {
        return await _db.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task AssignRolesAsync(int userId, List<int> roleIds)
    {
        // remove existing roles
        var existing = await _db.UserRoles.Where(ur => ur.UserId == userId).ToListAsync();
        _db.UserRoles.RemoveRange(existing);

        // add new roles
        foreach (var roleId in roleIds)
        {
            _db.UserRoles.Add(new UserRole
            {
                UserId = userId,
                RoleId = roleId
            });
        }

        await _db.SaveChangesAsync();
    }
}
