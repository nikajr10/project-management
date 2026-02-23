using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SetupController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public SetupController(AppDbContext context) 
    { 
        _context = context; 
    }

    // A simple DTO just for setup
    public class SetupDto 
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("init")]
    public async Task<IActionResult> InitDatabase([FromBody] SetupDto dto)
    {
        // 1. Security check: Only run if the database is completely empty
        if (await _context.Users.AnyAsync()) 
        {
            return BadRequest("Database is already initialized. Please clear the Users table first.");
        }

        // 2. Create the Admin User (API Handles the Hashing!)
        var admin = new User 
        { 
            Username = dto.Username, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), // <- The magic happens here
            Role = "Admin" 
        };
        _context.Users.Add(admin);
        await _context.SaveChangesAsync(); // Save to generate the Admin ID

        // 3. Create the Default Project
        var project = new Project 
        { 
            Name = "SmartBiz Dashboard", 
            Description = "Main Inventory Management Tracking", 
            OwnerId = admin.Id 
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync(); // Save to generate Project ID

        // 4. Create the Default Columns
        var todo = new BoardColumn { Name = "Todo", OrderIndex = 0, ProjectId = project.Id };
        var inProgress = new BoardColumn { Name = "In Progress", OrderIndex = 1, ProjectId = project.Id };
        var done = new BoardColumn { Name = "Done", OrderIndex = 2, ProjectId = project.Id };
        _context.BoardColumns.AddRange(todo, inProgress, done);
        await _context.SaveChangesAsync(); // Save to generate Column IDs

        // 5. Create a Welcome Task
        var task = new TaskItem 
        { 
            Title = "System Initialized", 
            Description = "The API successfully created and hashed your admin password.", 
            Priority = "High", 
            Position = 0, 
            ColumnId = todo.Id 
        };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Success! Admin and default project created. You can now log into the frontend." });
    }
}