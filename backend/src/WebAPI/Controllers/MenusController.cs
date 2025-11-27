using Application.Dtos.Menus;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public sealed class MenusController : BaseController
{
    private readonly AppDbContext _db;
    public MenusController(ILogger logger, AppDbContext db)
        : base(logger.ForContext<MenusController>())
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var menus = await _db.MenuMaster
            .Select(m => new MenuDto(default, default, null, null, default, default) { MenuId = m.Id, Name = m.Name, Icon = m.Icon, Route = m.Route, Order = m.Sequence })
            .ToListAsync().ConfigureAwait(false);

        return Ok(menus);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);
        if (m == null)
            return NotFound($"Role not found with id {id}");
        return Ok(new MenuDto(default, default, null, null, default, default) { MenuId = m.Id, Name = m.Name, Icon = m.Icon, Route = m.Route, Order = m.Sequence });
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreateMenuDto dto)
    {
        var m = new MenuMaster { Name = dto.Name, ParentId = dto.ParentMenuId, Route = dto.Route, Icon = dto.Icon, Sequence = dto.Order };
        _db.MenuMaster.Add(m);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(m, "Menu created.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, UpdateMenuDto dto)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);
        
        if (m == null)
            return NotFound($"Role not found with id {id}");

        m.Name = dto.Name;
        m.ParentId = dto.ParentMenuId;
        m.Route = dto.Route;
        m.Icon = dto.Icon;
        m.Sequence = dto.Order;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Menu updated.", m);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);
        if (m == null)
            return NotFound($"Role not found with id {id}");

        _db.MenuMaster.Remove(m);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Menu deleted.", m);
    }
}
