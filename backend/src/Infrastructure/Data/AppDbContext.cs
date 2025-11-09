using FinServe.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace FinServe.Infrastructure.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<PasswordHistory> PasswordHistories { get; set; } = null!;
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
    public DbSet<DashboardAlert> DashboardAlerts { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(b => {
            b.HasKey(r => r.Id);
            b.Property(r => r.Name).IsRequired().HasMaxLength(100);
            b.HasData(
                new Role { Id = 1, Name = "Admin", Description = "Platform administrator" },
                new Role { Id = 2, Name = "Employee", Description = "Internal employee" },
                new Role { Id = 3, Name = "Dealer", Description = "Car dealer" },
                new Role { Id = 4, Name = "Banker", Description = "Bank representative" },
                new Role { Id = 5, Name = "Customer", Description = "End customer" }
            );
        });

        modelBuilder.Entity<User>(b => {
            b.HasKey(u => u.Id);
            b.Property(u => u.Email).IsRequired().HasMaxLength(200);
            b.HasOne(u => u.Role).WithMany().HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);

            // Seed admin user
            b.HasData(new User
            {
                Id = 1,
                Email = "admin@finserve.com",
                Mobile = "9999999999",
                FullName = "Platform Admin",
                RoleId = 1,
                IsActive = true,
                IsApproved = true,
                EmailVerified = true,
                MobileVerified = true,
                // This is the PBKDF2-based hash format used by the AuthController HashPassword helper.
                // Replace with your own hashed value if you prefer.
                PasswordHash = "AQClchAv7t1dq3Rmxu7xgmEK4EbByfwx4UV0RUZprlFUXnupgTMWrHczDdfQb6z3WZh6AoD2Z8Q2+y4\r\n",
                PasswordLastChanged = System.DateTime.UtcNow
            });
        });

        modelBuilder.Entity<PasswordResetToken>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasOne(p => p.User)
             .WithMany()
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DashboardAlert>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Title).HasMaxLength(200).IsRequired();
            b.Property(a => a.Message).IsRequired();
            b.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        });

    }
}
