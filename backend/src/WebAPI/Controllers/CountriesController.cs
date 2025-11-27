using Application.Dtos.Countries;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CountriesController : BaseController
{
    private readonly AppDbContext _db;
    public CountriesController(ILogger logger, AppDbContext db)
        : base(logger.ForContext<CountriesController>())
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var countries = await _db.Countries
            .Select(c =>
            new CountryDto(c.Id, c.Name, c.IsoCode,c.MobileCode))
            .ToListAsync().ConfigureAwait(false);
        return Ok(countries);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var country = await _db.Countries.FindAsync(id).ConfigureAwait(false);

        if (country == null)
            return NotFound($"Country not found with id {id}");

        return Ok(new CountryDto(country.Id, country.Name, country.IsoCode, country.MobileCode));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Post(CreateCountryDto dto)
    {
        var country = new Country
        {
            Name = dto.Name,
            IsoCode = dto.IsoCode,
            MobileCode = dto.MobileCode
        };
        _db.Countries.Add(country);

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Created(country, "Country created.");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Put(int id, UpdateCountryDto dto)
    {
        var country = await _db.Countries.FindAsync(id).ConfigureAwait(false);

        if (country == null)
            return NotFound($"Country not found with id {id}");

        country.Name = dto.Name;
        country.IsoCode = dto.IsoCode;
        country.MobileCode = dto.MobileCode;

        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Country updated.", country);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var country = await _db.Countries.FindAsync(id).ConfigureAwait(false);

        if (country == null)
            return NotFound($"Country not found with id {id}");

        _db.Countries.Remove(country);
        await _db.SaveChangesAsync().ConfigureAwait(false);

        return Ok("Country deleted.", country);
    }
}
