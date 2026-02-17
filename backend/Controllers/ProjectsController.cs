using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // 1. Everyone must be logged in
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/projects
    // Logic: Admin sees ALL projects. User sees only THEIR projects.
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == "Admin")
        {
            return Ok(await _context.Projects.Include(p => p.Columns).ToListAsync());
        }
        
        // Regular User
        var projects = await _context.Projects
            .Where(p => p.OwnerId == userId)
            .Include(p => p.Columns)
            .ToListAsync();
        
        return Ok(projects);
    }

    // POST: api/projects
    [HttpPost]
    public async Task<IActionResult> CreateProject(Project project)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        project.OwnerId = userId;
        
        // Initialize default columns
        project.Columns = new List<BoardColumn> {
            new BoardColumn { Name = "Todo", OrderIndex = 0 },
            new BoardColumn { Name = "In Progress", OrderIndex = 1 },
            new BoardColumn { Name = "Done", OrderIndex = 2 }
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return Ok(project);
    }

    // DELETE: api/projects/5
    // Logic: Only Admins can delete projects.
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // <--- USES THE POLICY defined in Program.cs
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return Ok("Project deleted by Admin");
    }
}