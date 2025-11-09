using FinServe.Core.Entities;
using FinServe.Core.Interfaces;
using FinServe.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FinServe.Infrastructure.Repositories;
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;
    public UserRepository(AppDbContext db) { _db = db; }

    public async Task AddAsync(User user) => await _db.Users.AddAsync(user);
    public async Task<User?> GetByEmailAsync(string email) => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    public async Task<User?> GetByMobileAsync(string mobile) => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Mobile == mobile);
    public async Task<User?> GetByIdAsync(int id) => await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
    public async Task<IEnumerable<User>> GetPendingApprovalsAsync() => await _db.Users.Include(u => u.Role).Where(u => !u.IsApproved).ToListAsync();
    public async Task UpdateAsync(User user) => _db.Users.Update(user);
    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}
