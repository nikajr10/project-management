using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // NEW DTO: Handles the username, password, AND the checklist of project IDs
    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public List<int> ProjectIds { get; set; } = new(); 
    }

    // Public Login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {   
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { 
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role) 
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new { Token = tokenHandler.WriteToken(token), Role = user.Role });
    }

    // Admin Only: Create New User & Assign Projects
    [HttpPost("create-user")]
    [Authorize(Policy = "AdminOnly")] 
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("User already exists");

        // 1. Create the base User
        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User" // Admins create "Users" (Employees)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(); // Save to generate the User ID

        // 2. Map the checked projects from the UI to this new user
        if (dto.ProjectIds != null && dto.ProjectIds.Any())
        {
            var assignments = dto.ProjectIds.Select(projectId => new ProjectAssignment
            {
                ProjectId = projectId,
                UserId = user.Id
            });
            
            _context.ProjectAssignments.AddRange(assignments);
            await _context.SaveChangesAsync();
        }

        return Ok(new { Message = "Employee created and projects assigned successfully" });
    }
}