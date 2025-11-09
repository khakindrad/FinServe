using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/dev")]
[Authorize(Roles = "Admin")]
public class DevController : ControllerBase
{
    [HttpPost("run-password-expiry")]
    public async Task<IActionResult> Run([FromServices] PasswordExpiryNotificationService svc)
    {
        var cnt = await svc.RunAsync();
        return Ok(new { count = cnt });
    }
}
