namespace backend.DTOs;
public record LoginDto(string Username, string Password);
public record RegisterDto(string Username, string Password); // Used by Admin to create users