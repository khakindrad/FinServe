using FinServe.Core.Interfaces;
using FinServe.Infrastructure.Data;
using FinServe.Infrastructure.Repositories;
using FinServe.Infrastructure.Services;
using FinServe.WebAPI.Middleware;
using Microsoft.EntityFrameworkCore;
using Serilog;

internal sealed class Program
{
    public static void Main(string[] args)
    {
        try
        {
            var builder = WebApplication.CreateBuilder(args);
            Log.Logger = new LoggerConfiguration().ReadFrom.Configuration(builder.Configuration).Enrich.FromLogContext().CreateLogger();
            builder.Host.UseSerilog();

            var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new Exception("Missing DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(opt => opt.UseMySql(conn, ServerVersion.AutoDetect(conn)));

            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<RefreshTokenService>();
            builder.Services.AddScoped<EmailService>();
            builder.Services.AddScoped<MfaService>();
            builder.Services.AddScoped<PasswordResetService>();
            builder.Services.AddScoped<PasswordPolicyService>();
            builder.Services.AddScoped<PasswordHistoryService>();
            // Infrastructure services
            builder.Services.AddScoped<PasswordExpiryNotificationService>();
            builder.Services.AddHostedService<FinServe.WebAPI.HostedServices.PasswordExpiryHostedService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowLocal", b => b.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000"));
            });

            builder.Services.AddAuthentication("Bearer").AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // global exception handler (must be early in pipeline)
            app.UseGlobalExceptionHandler();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseSerilogRequestLogging();
            app.UseCors("AllowLocal");
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application start-up failed");
            Console.WriteLine(ex.Message);
        }
    }
}
