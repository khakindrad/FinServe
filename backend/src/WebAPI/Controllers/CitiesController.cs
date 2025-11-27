using Application.Dtos.Cities;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CitiesController : BaseController
{
    private readonly AppDbContext _db;
    public CitiesController(ILogger logger, AppDbContext db)
        : base(logger.ForContext<CitiesController>())
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var Citys = await _db.Cities
            .Select(s =>
            new CityDto(s.Id, s.Name, s.StateId)).ToListAsync().ConfigureAwait(false);

        return Ok(Citys);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var s = await _db.Cities.FindAsync(id).ConfigureAwait(false);

        if (s == null)
            return NotFound($"City not found with id {id}");

        return Ok(new CityDto(s.Id, s.Name, s.StateId));
    }

    [HttpGet("~/api/states/{stateId}/cities")]
    public async Task<IActionResult> GetByState(int stateId)
    {
        var cities = await _db.Cities
            .Where(c => c.StateId == stateId)
            .Select(c => new CityDto(c.Id, c.Name, c.StateId))
            .ToListAsync().ConfigureAwait(false);
        return Ok(cities);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Post(CreateCityDto dto)
    {
        var city = new City { Name = dto.Name, StateId = dto.StateId };
        _db.Cities.Add(city);

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(city, "City created.");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Put(int id, UpdateCityDto dto)
    {
        var city = await _db.Cities.FindAsync(id).ConfigureAwait(false);
        if (city == null)
            return NotFound($"City not found with id {id}");

        city.Name = dto.Name;
        city.StateId = dto.StateId;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("City updated.", city);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var city = await _db.Cities.FindAsync(id).ConfigureAwait(false);
        if (city == null)
            return NotFound($"City not found with id {id}");

        _db.Cities.Remove(city);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("City deleted.", city);
    }
}

