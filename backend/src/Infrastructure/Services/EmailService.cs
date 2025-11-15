using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Services;
public class EmailService
{
    private readonly IConfiguration _config;
    public EmailService(IConfiguration config) { _config = config; }

    public async Task SendEmailAsync(string to, string subject, string html)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"];
        var port = int.Parse(smtp["Port"] ?? "587");
        var user = smtp["User"];
        var pass = smtp["Pass"];
        var from = smtp["From"];

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };
        var msg = new MailMessage(from, to, subject, html) { IsBodyHtml = true };
        await client.SendMailAsync(msg);
    }
}
