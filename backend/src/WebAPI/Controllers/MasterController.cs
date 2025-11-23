using Application.Dtos;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MasterController : ControllerBase
{
    [HttpGet("genders")]
    public IActionResult GetGenders()
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
