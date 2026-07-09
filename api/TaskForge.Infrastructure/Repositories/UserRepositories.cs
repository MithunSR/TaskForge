using Dapper;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Entities;
using TaskForge.Infrastructure.Data;

namespace TaskForge.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _factory;

    public UserRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<User> RegisterAsync(string name, string email, string passwordHash)
    {
        using var connection = _factory.CreateConnection();
        return await connection.QuerySingleAsync<User>(
            @"SELECT id AS ""Id"", name AS ""Name"", email AS ""Email"", role_name AS ""RoleName""
              FROM fn_register_user(@Name, @Email, @PasswordHash)",
            new { Name = name, Email = email, PasswordHash = passwordHash });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _factory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(
            @"SELECT id AS ""Id"", name AS ""Name"", email AS ""Email"",
                     password_hash AS ""PasswordHash"", role_name AS ""RoleName""
              FROM fn_get_user_by_email(@Email)",
            new { Email = email });
    }
    public async Task<List<User>> GetAllAsync()
    {
        using var connection = _factory.CreateConnection();
        var users = await connection.QueryAsync<User>(
            @"SELECT id AS ""Id"", name AS ""Name"", email AS ""Email"", role_name AS ""RoleName""
              FROM fn_get_all_users()");
        return users.ToList();
    }
}