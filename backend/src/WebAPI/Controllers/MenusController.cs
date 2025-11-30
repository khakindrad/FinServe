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
            .Select(m => new MenuDto(m.Id, m.Name, m.Icon, m.Route, m.Sequence))
            .ToListAsync().ConfigureAwait(false);

        return Ok(menus);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);
        if (m == null)
            return NotFound($"Menu not found with id {id}");
        return Ok(new MenuDto(m.Id, m.Name, m.Icon, m.Route, m.Sequence));
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreateMenuDto dto)
    {
        var exists = await _db.MenuMaster.FirstOrDefaultAsync(x => x.Name == dto.Name).ConfigureAwait(false);

        if (exists is not null)
        {
            return BadRequest($"Menu with name {exists.Name} already exists.");
        }

        var m = new MenuMaster { Name = dto.Name, ParentId = dto.ParentMenuId, Route = dto.Route, Icon = dto.Icon, Sequence = dto.Order };
        _db.MenuMaster.Add(m);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(m, "Menu created.");
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Put(int id, UpdateMenuDto dto)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);

        if (m == null)
            return NotFound($"Menu not found with id {id}");

        var exists = await _db.MenuMaster.FirstOrDefaultAsync(x => x.Name == dto.Name).ConfigureAwait(false);

        if (exists is not null)
        {
            return BadRequest($"Menu with name {exists.Name} already exists.");
        }

        if (dto.Name is not null) m.Name = dto.Name;
        if (dto.ParentMenuId is not null) m.ParentId = dto.ParentMenuId;
        if (dto.Route is not null) m.Route = dto.Route;
        if (dto.Icon is not null) m.Icon = dto.Icon;
        if (dto.Order is not null) m.Sequence = dto.Order.Value;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Menu updated.", m);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var m = await _db.MenuMaster.FindAsync(id).ConfigureAwait(false);

        if (m == null)
            return NotFound($"Menu not found with id {id}");

        _db.MenuMaster.Remove(m);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Menu deleted.", m);
    }
}
