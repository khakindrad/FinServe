using Application.Dtos;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

public class MenuService : IMenuService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MenuService> _logger;


    public MenuService(AppDbContext db, IMemoryCache cache, ILogger<MenuService> logger)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
    }


    public async Task<List<MenuDto>> GetMenuForRolesAsync(IEnumerable<string> roles)
    {
        // Build cache key
        var key = "menu_" + string.Join("_", roles.OrderBy(r => r));
        if (_cache.TryGetValue(key, out List<MenuDto>? cached))
            return cached!;


        var roleNames = roles.ToList();


        // Query: join Role -> RoleMenus -> MenuMaster
        var menus = await (from r in _db.Roles
                           where roleNames.Contains(r.Name)
                           join rm in _db.RoleMenus on r.Id equals rm.RoleId
                           join m in _db.MenuMaster on rm.MenuId equals m.MenuId
                           where m.IsActive
                           select m)
        .Distinct()
        .OrderBy(m => m.Sequence)
        .AsNoTracking()
        .ToListAsync();

        // Build hierarchy
        var dict = menus.ToDictionary(m => m.MenuId, m => new MenuDto
        {
            MenuId = m.MenuId,
            Name = m.Name,
            Route = m.Route,
            Icon = m.Icon
        });


        var roots = new List<MenuDto>();


        foreach (var m in menus)
        {
            if (m.ParentId.HasValue && dict.ContainsKey(m.ParentId.Value))
            {
                dict[m.ParentId.Value].Children.Add(dict[m.MenuId]);
            }
            else
            {
                roots.Add(dict[m.MenuId]);
            }
        }
        // Cache result (5 minutes default)
        _cache.Set(key, roots, TimeSpan.FromMinutes(5));
        return roots;
    }
}