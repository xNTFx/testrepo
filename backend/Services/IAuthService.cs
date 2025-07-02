using backend.Entities;
using backend.Models;

namespace backend.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(UserDto request);
    Task<TokenResponseDto?> LoginAsync(UserDto request);
    Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken);
    Task<bool> LogoutAsync(string? refreshToken);
}

