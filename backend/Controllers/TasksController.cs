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
    public async Task<IActionResult> CreateTask(CreateTaskDto dto)
    {
        var maxPos = await _context.Tasks
            .Where(t => t.ColumnId == dto.ColumnId)
            .MaxAsync(t => (int?)t.Position) ?? -1;

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            ColumnId = dto.ColumnId,
            Position = maxPos + 1
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return Ok(task);
    }

    [HttpPost("move")]
    public async Task<IActionResult> MoveTask(MoveTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(dto.TaskId);
        if (task == null) return NotFound();

        // 1. Remove from old column (shift others up)
        var oldColTasks = await _context.Tasks
            .Where(t => t.ColumnId == task.ColumnId && t.Id != task.Id && t.Position > task.Position)
            .ToListAsync();
        foreach (var t in oldColTasks) t.Position--;

        // 2. Make space in new column (shift others down)
        var newColTasks = await _context.Tasks
            .Where(t => t.ColumnId == dto.TargetColumnId && t.Position >= dto.NewPosition)
            .ToListAsync();
        foreach (var t in newColTasks) t.Position++;

        // 3. Update task
        task.ColumnId = dto.TargetColumnId;
        task.Position = dto.NewPosition;

        await _context.SaveChangesAsync();
        return Ok();
    }
}