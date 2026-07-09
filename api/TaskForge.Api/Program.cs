using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TaskForge.Application.Interfaces;
using TaskForge.Application.Services;
using TaskForge.Infrastructure.Auth;
using TaskForge.Infrastructure.Data;
using TaskForge.Infrastructure.Repositories;
using TaskForge.Api.Services;
using TaskForge.Api.Hubs;


var builder = WebApplication.CreateBuilder(args);

// ---- Configuration ----
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// ---- Dependency injection ----
builder.Services.AddSingleton<IDbConnectionFactory>(new NpgsqlConnectionFactory(connectionString));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITaskRepository ,TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddSignalR();
builder.Services.AddScoped<ITaskNotifier, TaskNotifier>();

// ---- Authentication ----
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;   // ← add this line
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

// ---- Authorization ----
builder.Services.AddAuthorization();

// ---- Health checks ----
builder.Services.AddHealthChecks().AddNpgSql(connectionString, name: "postgres");

// ---- API essentials ----
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

app.UseMiddleware<TaskForge.Api.Middleware.GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<TaskHub>("/hubs/tasks");
app.MapHealthChecks("/health");

app.Run();