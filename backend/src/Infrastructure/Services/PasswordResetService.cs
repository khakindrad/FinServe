using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
namespace Infrastructure.Services;

public class PasswordResetService
{
    private readonly AppDbContext _db;

    public PasswordResetService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PasswordResetToken> CreateTokenAsync(int userId, int expiryMinutes = 30)
    {
        // Invalidate old tokens
        var existing = await _db.PasswordResetTokens
            .Where(x => x.UserId == userId && !x.Used && x.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var t in existing)
        {
            t.Used = true;
        }

        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes);

        var prt = new PasswordResetToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };

        _db.PasswordResetTokens.Add(prt);
        await _db.SaveChangesAsync();
        return prt;
    }

    public async Task<User?> ValidateTokenAsync(string token)
    {
        var record = await _db.PasswordResetTokens
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Token == token && !p.Used && p.ExpiresAt > DateTime.UtcNow);

        if (record == null) return null;

        record.Used = true;
        await _db.SaveChangesAsync();
        return record.User;
    }
}