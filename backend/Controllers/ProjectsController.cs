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

    public record CreateProjectDto(string Name, string Description);

    // BULLETPROOF ID EXTRACTOR: Checks all possible ways .NET might store the token ID
    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? 
                    User.FindFirst("sub") ?? 
                    User.FindFirst("nameid") ??
                    User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        
        return int.Parse(claim?.Value ?? "0");
    }

    // BULLETPROOF ROLE EXTRACTOR
    private string GetUserRole()
    {
        var claim = User.FindFirst(ClaimTypes.Role) ?? 
                    User.FindFirst("role") ??
                    User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
                    
        return claim?.Value ?? "User";
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        var userId = GetUserId();
        var role = GetUserRole();

        if (role == "Admin")
        {
            // Admins see all projects
            return await _context.Projects
                .Include(p => p.Columns)
                .ThenInclude(c => c.Tasks)
                .ToListAsync();
        }
        else
        {
            // Regular users ONLY see projects they are assigned to
            var assignedProjectIds = await _context.ProjectAssignments
                .Where(pa => pa.UserId == userId)
                .Select(pa => pa.ProjectId)
                .ToListAsync();

            return await _context.Projects
                .Include(p => p.Columns)
                .ThenInclude(c => c.Tasks)
                .Where(p => assignedProjectIds.Contains(p.Id))
                .ToListAsync();
        }
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
        var userId = GetUserId();
        
        if (userId == 0) return Unauthorized("Invalid user token. Could not read user ID.");

        // Create the Project
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(); // Save to get the Project ID

        // AUTOMATICALLY Create Default Columns
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