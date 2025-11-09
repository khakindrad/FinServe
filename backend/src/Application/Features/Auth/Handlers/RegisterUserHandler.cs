using Core.Interfaces;
using FinServe.Core.Entities;
using System.Threading.Tasks;

namespace Application.Features.Auth.Handlers;
public class RegisterUserHandler
{
    private readonly IUserRepository _repo;
    public RegisterUserHandler(IUserRepository repo) { _repo = repo; }
    public async Task<int> Handle(RegisterUserCommand cmd)
    {
        var user = new User { Email = cmd.Email, Mobile = cmd.Mobile, FullName = cmd.FullName ?? cmd.Email, Role = null, IsActive = true, IsApproved = false };
        await _repo.AddAsync(user);
        await _repo.SaveChangesAsync();
        return user.Id;
    }
}
