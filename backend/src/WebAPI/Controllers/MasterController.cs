using Application.Dtos;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using ILogger = Serilog.ILogger;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MasterController : BaseController
{
    public MasterController(ILogger logger)
        : base(logger.ForContext<MasterController>())
    {
    }

    [HttpGet("genders")]
    public async Task<IActionResult> GetGenders()
    {
        var genders = Enum.GetValues(typeof(Gender))
            .Cast<Gender>()
            .Select(g => new GenderDto
            {
                Id = (int)g,
                Name = g.ToString()
            })
            .ToList();

        return Ok(genders);
    }
}
