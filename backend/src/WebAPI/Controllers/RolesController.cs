using Application.Dtos.Menus;
using Application.Dtos.Roles;
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
public sealed class RolesController : BaseController
{
    private readonly AppDbContext _db;
    public RolesController(ILogger logger, AppDbContext db)
        : base(logger.ForContext<RolesController>())
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var roles = await _db.Roles
            .Select(r => new RoleDto(r.Id, r.Name, r.Description, r.RoleMenus.Select(rm => rm.MenuMaster.Name).ToList()))
            .ToListAsync().ConfigureAwait(false);

        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var r = await _db.Roles.FindAsync(id).ConfigureAwait(false);

        if (r == null)
            return NotFound($"Role not found with id {id}");

        return Ok(new RoleDto(r.Id, r.Name, r.Description, [.. r.RoleMenus.Select(rm => rm.MenuMaster.Name)]));
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreateRoleDto dto)
    {
        var exists = await _db.Roles.FirstOrDefaultAsync(x => x.Name == dto.Name).ConfigureAwait(false);

        if (exists is not null)
        {
            return BadRequest($"Role with name {exists.Name} already exists.");
        }

        var r = new Role { Name = dto.Name, Description = dto.Description, IsActive = dto.IsActive };
        _db.Roles.Add(r);

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(r, "Role created.");
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Put(int id, UpdateRoleDto dto)
    {
        var r = await _db.Roles.FindAsync(id).ConfigureAwait(false);

        if (r == null)
            return NotFound($"Role not found with id {id}");

        var exists = await _db.Roles.FirstOrDefaultAsync(x => x.Name == dto.Name).ConfigureAwait(false);

        if (exists is not null)
        {
            return BadRequest($"Role with name {exists.Name} already exists.");
        }

        if (dto.Name is not null) r.Name = dto.Name;
        if (dto.Description is not null) r.Description = dto.Description;
        if (dto.IsActive is not null) r.IsActive = dto.IsActive.Value;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(r, "Role updated.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _db.Roles.FindAsync(id).ConfigureAwait(false);
        if (r == null)
            return NotFound($"Role not found with id {id}");

        _db.Roles.Remove(r);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(r, "Role deleted.");
    }

    //GET Menus for a Role
    [HttpGet("menus/{roleId}")]
    public async Task<IActionResult> GetMenus(int roleId)
    {
        var menus = await _db.RoleMenus
            .Where(rm => rm.RoleId == roleId)
            .Select(rm => new MenuDto(rm.MenuId, rm.MenuMaster.Name, rm.MenuMaster.Route, rm.MenuMaster.Icon, rm.MenuMaster.Sequence))
            .ToListAsync().ConfigureAwait(false);

        return Ok(menus);
    }

    //Assign Menus to a Role
    [HttpPost("menus/{roleId}")]
    public async Task<IActionResult> AssignMenus(int roleId, AssignMenusDto dto)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == roleId).ConfigureAwait(false);

        if (role is null)
            return NotFound($"Role not found with id {roleId}");

        var menuExists = role.RoleMenus.FirstOrDefault(x => dto.MenuIds.Contains(x.MenuId));

        if (menuExists is not null)
        {
            return BadRequest($"Role {role.Name} with menu {menuExists.MenuMaster.Name} already exists.");
        }

        // Remove old assignments
        var old = _db.RoleMenus.Where(rm => rm.RoleId == roleId);
        _db.RoleMenus.RemoveRange(old);

        // Add new ones
        foreach (var menuId in dto.MenuIds)
        {
            _db.RoleMenus.Add(new RoleMenu
            {
                RoleId = roleId,
                MenuId = menuId
            });
        }

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Menus assigned successfully");
    }
}
