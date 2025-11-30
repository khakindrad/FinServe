using Application.Dtos.Menus;
using Common;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ILogger = Serilog.ILogger;

public sealed class MenuService : BaseService, IMenuService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;

    public MenuService(ILogger logger, AppDbContext db, IMemoryCache cache)
        :base(logger.ForContext<MenuService>(), null)
    {
        _db = db;
        _cache = cache;
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
                           join m in _db.MenuMaster on rm.MenuId equals m.Id
                           where m.IsActive
                           select m)
        .Distinct()
        .OrderBy(m => m.Sequence)
        .AsNoTracking()
        .ToListAsync().ConfigureAwait(false);

        // Build hierarchy
        var dict = menus.ToDictionary(m => m.Id, m => new MenuDto(m.Id, m.Name, m.Route, m.Icon, m.Sequence));

        var roots = new List<MenuDto>();


        foreach (var m in menus)
        {
            if (m.ParentId.HasValue && dict.ContainsKey(m.ParentId.Value))
            {
                dict[m.ParentId.Value].Children.Add(dict[m.Id]);
            }
            else
            {
                roots.Add(dict[m.Id]);
            }
        }
        // Cache result (5 minutes default)
        _cache.Set(key, roots, TimeSpan.FromMinutes(5));
        return roots;
    }
}