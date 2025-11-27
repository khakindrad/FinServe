using Application.Dtos.States;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StatesController : BaseController
{
    private readonly AppDbContext _db;
    public StatesController(ILogger logger, AppDbContext db)
        : base(logger.ForContext<StatesController>())
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var states = await _db.States
            .Select(s =>
            new StateDto(s.Id, s.Name,s.CountryId))
            .ToListAsync().ConfigureAwait(false);

        return Ok(states);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var s = await _db.States.FindAsync(id).ConfigureAwait(false);

        if (s == null)
            return NotFound($"State not found with id {id}");

        return Ok(new StateDto(s.Id, s.Name, s.CountryId));
    }

    [HttpGet("~/api/countries/{countryId}/states")]
    public async Task<IActionResult> GetByCountry(int countryId)
    {
        var states = await _db.States
            .Where(s => s.CountryId == countryId)
            .Select(s => new StateDto(s.Id, s.Name, s.CountryId))
            .ToListAsync().ConfigureAwait(false);

        return Ok(states);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Post(CreateStateDto dto)
    {
        var state = new State { Name = dto.Name, CountryId = dto.CountryId };
        _db.States.Add(state);

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(state, "State created.");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Put(int id, UpdateStateDto dto)
    {
        var state = await _db.States.FindAsync(id).ConfigureAwait(false);
        if (state == null)
            return NotFound($"State not found with id {id}");

        state.Name = dto.Name;
        state.CountryId = dto.CountryId;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("State updated.", state);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var state = await _db.States.FindAsync(id).ConfigureAwait(false);
        if (state == null)
            return NotFound($"State not found with id {id}");

        _db.States.Remove(state);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("State deleted.", state);
    }
}

