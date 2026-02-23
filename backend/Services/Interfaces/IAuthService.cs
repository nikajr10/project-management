using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IAuthService
{
    Task<User> RegisterAsync(RegisterDto dto);
    Task<string?> LoginAsync(LoginDto dto);
}