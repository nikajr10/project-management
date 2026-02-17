namespace backend.DTOs;

public record LoginDto(string Username, string Password);
public record RegisterDto(string Username, string Password);
public record AuthResponseDto(string Token, string Username);