  using TaskForge.Application.DTOs;

namespace TaskForge.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterDto dto);
    Task<AuthResult?> LoginAsync(LoginDto dto);
} 