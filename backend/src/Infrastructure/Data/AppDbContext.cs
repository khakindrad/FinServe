using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base(options) 
    {
    }
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<PasswordHistory> PasswordHistories { get; set; } = null!;
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
    public DbSet<LoginHistory> LoginHistory { get; set; }
    public DbSet<DashboardAlert> DashboardAlerts { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<MenuMaster> MenuMaster { get; set; } = null!;
    public DbSet<RoleMenu> RoleMenus { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<MobileVerificationToken> MobileVerificationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(b =>
        {
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

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.Email).IsRequired().HasMaxLength(200);
            b.HasMany(u => u.UserRoles);
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

        //modelBuilder.Entity<LoginHistory>(b =>
        //{
        //    b.HasKey(l => l.Id);
        //    b.Property(l => l.Email).HasMaxLength(200);
        //    b.Property(l => l.IpAddress).HasMaxLength(50);
        //    b.Property(l => l.Device).HasMaxLength(255);
        //    b.Property(l => l.Status).HasMaxLength(20).HasDefaultValue("SUCCESS");
        //    b.Property(l => l.Message).HasMaxLength(255);
        //    b.Property(l => l.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        //    b.HasOne(l => l.User)
        //        .WithMany()
        //        .HasForeignKey(l => l.UserId)
        //        .OnDelete(DeleteBehavior.SetNull);
        //});
        modelBuilder.Entity<Country>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.Property(c => c.IsoCode).HasMaxLength(10);
            b.Property(c => c.MobileCode).HasMaxLength(10);
        });

        modelBuilder.Entity<State>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.Name).HasMaxLength(100).IsRequired();
            b.HasOne(s => s.Country)
                .WithMany(c => c.States)
                .HasForeignKey(s => s.CountryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<City>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.HasOne(c => c.State)
                .WithMany(s => s.Cities)
                .HasForeignKey(c => c.StateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Country>().HasData(
            new Country { Id = 1, Name = "India", IsoCode = "IN", MobileCode = "+91" },
            new Country { Id = 2, Name = "United States", IsoCode = "US", MobileCode = "+1" }
            );

        modelBuilder.Entity<State>().HasData(
            new State { Id = 1, Name = "Maharashtra", CountryId = 1 },
            new State { Id = 2, Name = "Gujarat", CountryId = 1 },
            new State { Id = 3, Name = "California", CountryId = 2 }
        );

        modelBuilder.Entity<City>().HasData(
            new City { Id = 1, Name = "Mumbai", StateId = 1 },
            new City { Id = 2, Name = "Pune", StateId = 1 },
            new City { Id = 3, Name = "Ahmedabad", StateId = 2 },
            new City { Id = 4, Name = "San Francisco", StateId = 3 }
        );

        // USER <--> ROLE (Join Table)
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
        .HasOne(ur => ur.Role)
        .WithMany(r => r.UserRoles)
        .HasForeignKey(ur => ur.RoleId);

        // ROLE <--> MENU (Join Table)
        modelBuilder.Entity<RoleMenu>()
            .HasKey(rm => new { rm.RoleId, rm.MenuId });

        modelBuilder.Entity<RoleMenu>()
        .HasOne(rm => rm.Role)
        .WithMany(r => r.RoleMenus)
        .HasForeignKey(rm => rm.RoleId);

        modelBuilder.Entity<RoleMenu>()
        .HasOne(rm => rm.MenuMaster)
        .WithMany(m => m.RoleMenus)
        .HasForeignKey(rm => rm.MenuId);

        modelBuilder.Entity<MenuMaster>()
            .HasKey(m => m.MenuId);

        modelBuilder.Entity<MenuMaster>()
            .HasMany(m => m.Children)
            .WithOne()
            .HasForeignKey(m => m.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
