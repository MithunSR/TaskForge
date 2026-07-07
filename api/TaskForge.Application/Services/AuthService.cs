using TaskForge.Application.DTOs;
using TaskForge.Application.Interfaces;

namespace TaskForge.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> RegisterAsync(RegisterDto dto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = await _userRepository.RegisterAsync(dto.Name, dto.Email, passwordHash);
        var token = _jwtService.GenerateToken(user.Id, user.Email, user.RoleName);
        return new AuthResult(token, user.RoleName);
    }

    public async Task<AuthResult?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user is null) return null;

        var valid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!valid) return null;

        var token = _jwtService.GenerateToken(user.Id, user.Email, user.RoleName);
        return new AuthResult(token, user.RoleName);
    }
}