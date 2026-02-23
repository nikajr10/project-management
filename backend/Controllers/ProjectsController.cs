using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    // DTO for receiving project data
    public record CreateProjectDto(string Name, string Description);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        // Return projects owned by user OR where user is assigned
        return await _context.Projects
            .Include(p => p.Columns)
            .ThenInclude(c => c.Tasks) // Include tasks count if needed
            .Where(p => p.OwnerId == userId)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Columns.OrderBy(c => c.OrderIndex))
            .ThenInclude(c => c.Tasks.OrderBy(t => t.Position))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();

        return project;
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Project>> CreateProject(CreateProjectDto dto)
    {
        // 1. Get the logged-in user's ID safely
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized("User ID not found in token");
        
        var userId = int.Parse(userIdString);

        // 2. Create the Project
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(); // Save to get the Project ID

        // 3. AUTOMATICALLY Create Default Columns
        var columns = new List<BoardColumn>
        {
            new BoardColumn { Name = "Todo", OrderIndex = 0, ProjectId = project.Id },
            new BoardColumn { Name = "In Progress", OrderIndex = 1, ProjectId = project.Id },
            new BoardColumn { Name = "Done", OrderIndex = 2, ProjectId = project.Id }
        };

        _context.BoardColumns.AddRange(columns);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }
}