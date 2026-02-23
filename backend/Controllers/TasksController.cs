using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public TasksController(AppDbContext context) 
    { 
        _context = context; 
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateTask(CreateTaskDto dto)
    {
        var task = new TaskItem {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            ColumnId = dto.ColumnId,
            AssignedUserId = dto.AssignedUserId,
            Position = await _context.Tasks.Where(t => t.ColumnId == dto.ColumnId).CountAsync()
        };
        
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return Ok(task);
    }

    // NEW: Endpoint to edit a task
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.StartDate = dto.StartDate;
        task.DueDate = dto.DueDate;
        task.AssignedUserId = dto.AssignedUserId;

        // Handle column change during edit
        if (task.ColumnId != dto.ColumnId)
        {
            task.ColumnId = dto.ColumnId;
            // Add to end of new column
            task.Position = await _context.Tasks.Where(t => t.ColumnId == dto.ColumnId).CountAsync();
        }

        await _context.SaveChangesAsync();
        return Ok(task);
    }

    [HttpPost("move")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> MoveTask(MoveTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(dto.TaskId);
        if (task == null) return NotFound();

        // Reorder old column
        var oldColTasks = await _context.Tasks.Where(t => t.ColumnId == task.ColumnId && t.Id != task.Id && t.Position > task.Position).ToListAsync();
        foreach (var t in oldColTasks) t.Position--;

        // Reorder new column space
        var newColTasks = await _context.Tasks.Where(t => t.ColumnId == dto.TargetColumnId && t.Position >= dto.NewPosition).ToListAsync();
        foreach (var t in newColTasks) t.Position++;

        task.ColumnId = dto.TargetColumnId;
        task.Position = dto.NewPosition;
        
        await _context.SaveChangesAsync();
        return Ok();
    }
}