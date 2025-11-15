using Application.Dtos;

namespace Infrastructure.Services;

// Services/IMenuService.cs
public interface IMenuService
{
    Task<List<MenuDto>> GetMenuForRolesAsync(IEnumerable<string> roles);
}
