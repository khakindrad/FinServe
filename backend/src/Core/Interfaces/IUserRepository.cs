using Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Core.Interfaces;
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task<User> GetByEmailAsync(string email);
    Task<User> GetByMobileAsync(string mobile);
    Task<IEnumerable<User>> GetPendingApprovalsAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task SaveChangesAsync();
}
