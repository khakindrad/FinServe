using Application.Dtos;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private readonly AppDbContext _db;

    public LocationController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("countries")]
    public async Task<ActionResult<IEnumerable<CountryDto>>> GetCountries()
    {
        var countries = await _db.Countries
            .Select(c => new CountryDto { Id = c.Id, Name = c.Name, IsoCode = c.IsoCode, MobileCode = c.MobileCode })
            .ToListAsync();
        return Ok(countries);
    }

    [HttpGet("states/{countryId}")]
    public async Task<ActionResult<IEnumerable<StateDto>>> GetStates(int countryId)
    {
        var states = await _db.States
            .Where(s => s.CountryId == countryId)
            .Select(s => new StateDto { Id = s.Id, Name = s.Name, CountryId = s.CountryId })
            .ToListAsync();
        return Ok(states);
    }

    [HttpGet("cities/{stateId}")]
    public async Task<ActionResult<IEnumerable<CityDto>>> GetCities(int stateId)
    {
        var cities = await _db.Cities
            .Where(c => c.StateId == stateId)
            .Select(c => new CityDto { Id = c.Id, Name = c.Name, StateId = c.StateId })
            .ToListAsync();
        return Ok(cities);
    }
}
