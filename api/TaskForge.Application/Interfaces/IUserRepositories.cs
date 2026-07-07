using TaskForge.Domain.Entities;

namespace TaskForge.Application.Interfaces;

public interface IUserRepository
{
    Task<User> RegisterAsync(string name, string email, string passwordHash);
    Task<User?> GetByEmailAsync(string email);
}