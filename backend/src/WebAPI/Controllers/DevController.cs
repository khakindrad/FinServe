using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Controllers;

[ApiController]
[Route("api/dev")]
[Authorize(Roles = "Admin")]
public class DevController : BaseController
{
    [HttpPost("run-password-expiry")]
    public async Task<IActionResult> Run([FromServices] PasswordExpiryNotificationService svc)
    {
        var cnt = await svc.RunAsync();

        return Ok($"Run completed for count {cnt}.");
    }
}
