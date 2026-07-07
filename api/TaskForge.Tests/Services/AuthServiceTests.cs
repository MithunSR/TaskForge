using Moq;
using TaskForge.Application.DTOs;
using TaskForge.Application.Interfaces;
using TaskForge.Application.Services;
using TaskForge.Domain.Entities;
using Xunit;

namespace TaskForge.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _jwtServiceMock = new Mock<IJwtService>();
        _authService = new AuthService(_userRepositoryMock.Object, _jwtServiceMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ValidInput_ReturnsTokenAndRole()
    {
        // Arrange
        var dto = new RegisterDto("Jane Doe", "jane@taskforge.dev", "SecurePass123!");
        var createdUser = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            RoleName = "User"
        };

        _userRepositoryMock
            .Setup(r => r.RegisterAsync(dto.Name, dto.Email, It.IsAny<string>()))
            .ReturnsAsync(createdUser);

        _jwtServiceMock
            .Setup(j => j.GenerateToken(createdUser.Id, createdUser.Email, createdUser.RoleName))
            .Returns("fake-jwt-token");

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        Assert.Equal("fake-jwt-token", result.Token);
        Assert.Equal("User", result.Role);
    }

    [Fact]
    public async Task RegisterAsync_HashesPasswordBeforeStoringIt()
    {
        // Arrange
        var dto = new RegisterDto("Jane Doe", "jane@taskforge.dev", "SecurePass123!");
        string? capturedHash = null;

        _userRepositoryMock
            .Setup(r => r.RegisterAsync(dto.Name, dto.Email, It.IsAny<string>()))
            .Callback<string, string, string>((_, _, hash) => capturedHash = hash)
            .ReturnsAsync(new User { Id = Guid.NewGuid(), Name = dto.Name, Email = dto.Email, RoleName = "User" });

        _jwtServiceMock
            .Setup(j => j.GenerateToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns("fake-jwt-token");

        // Act
        await _authService.RegisterAsync(dto);

        // Assert — the raw password should never reach the repository
        Assert.NotNull(capturedHash);
        Assert.NotEqual(dto.Password, capturedHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, capturedHash));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenAndRole()
    {
        // Arrange
        var plainPassword = "SecurePass123!";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        var dto = new LoginDto("jane@taskforge.dev", plainPassword);

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Jane Doe",
            Email = dto.Email,
            PasswordHash = hashedPassword,
            RoleName = "User"
        };

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync(dto.Email))
            .ReturnsAsync(existingUser);

        _jwtServiceMock
            .Setup(j => j.GenerateToken(existingUser.Id, existingUser.Email, existingUser.RoleName))
            .Returns("fake-jwt-token");

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("fake-jwt-token", result!.Token);
        Assert.Equal("User", result.Role);
    }

    [Fact]
    public async Task LoginAsync_UserDoesNotExist_ReturnsNull()
    {
        // Arrange
        var dto = new LoginDto("nobody@taskforge.dev", "whatever");

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsNull()
    {
        // Arrange
        var correctPassword = "SecurePass123!";
        var wrongPassword = "WrongPassword!";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(correctPassword);

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Jane Doe",
            Email = "jane@taskforge.dev",
            PasswordHash = hashedPassword,
            RoleName = "User"
        };

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync(existingUser.Email))
            .ReturnsAsync(existingUser);

        var dto = new LoginDto(existingUser.Email, wrongPassword);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        Assert.Null(result);
    }
}