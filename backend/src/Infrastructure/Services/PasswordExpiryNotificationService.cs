using FinServe.Core.Entities;
using FinServe.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FinServe.Infrastructure.Services;

public class PasswordExpiryNotificationService
{
    private readonly AppDbContext _db;
    private readonly EmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<PasswordExpiryNotificationService> _logger;

    public PasswordExpiryNotificationService(AppDbContext db, EmailService email, IConfiguration config, ILogger<PasswordExpiryNotificationService> logger)
    {
        _db = db;
        _email = email;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Finds users whose passwords expire in exactly or within configured reminder window (e.g., within next 7 days),
    /// sends email reminders and creates dashboard alerts. Returns count of actions done.
    /// </summary>
    public async Task<int> RunAsync(CancellationToken cancellationToken = default)
    {
        var reminderDays = _config.GetValue<int>("Security:PasswordExpiryReminderDays", 7);
        var now = DateTime.UtcNow;
        var reminderUntil = now.AddDays(reminderDays);

        // Find users who have a PasswordExpiryDate set and expiry is between now (inclusive) and reminderUntil (inclusive)
        // and who haven't already an identical alert for this expiry (to avoid duplicate emails).
        var candidates = await _db.Users
            .Where(u => u.IsActive && u.PasswordExpiryDate != null && u.PasswordExpiryDate >= now && u.PasswordExpiryDate <= reminderUntil)
            .ToListAsync(cancellationToken);

        var actions = 0;
        foreach (var user in candidates)
        {
            cancellationToken.ThrowIfCancellationRequested();

            // Check if we already created an alert for this expiry for this user in the last (reminderDays + 1) days
            var existing = await _db.DashboardAlerts
                .Where(a => a.UserId == user.Id && a.Title == "Password Expiry Reminder" && a.CreatedAt >= now.AddDays(-(reminderDays + 1)))
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                _logger.LogDebug("Skipping user {Email} — existing reminder found.", user.Email);
                continue;
            }

            // Compose message
            var daysLeft = (user.PasswordExpiryDate!.Value - now).Days;
            if (daysLeft < 0) daysLeft = 0;
            var expiryStr = user.PasswordExpiryDate!.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var title = "Password Expiry Reminder";
            var message = $"Hello {user.FullName}, your account password will expire on {expiryStr} (in {daysLeft} day(s)). Please change your password to avoid being locked out.";

            // Insert dashboard alert
            var alert = new DashboardAlert
            {
                UserId = user.Id,
                Title = title,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _db.DashboardAlerts.Add(alert);

            // Send email (best-effort, do not fail the whole loop)
            try
            {
                await _email.SendEmailAsync(user.Email, title, $"<p>{message}</p><p><a href='{_config["Frontend:BaseUrl"] ?? "http://localhost:3000"}/'>Login to change</a></p>");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send password expiry email to {Email}", user.Email);
            }

            actions++;
        }

        if (actions > 0)
            await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("PasswordExpiryNotificationService completed: {Count} actions", actions);
        return actions;
    }
}
