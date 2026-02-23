namespace backend.DTOs;

public record MoveTaskDto(int TaskId, int TargetColumnId, int NewPosition);

public record CreateTaskDto(
    string Title, 
    string Description, 
    string Priority, 
    int ColumnId,
    DateTime? StartDate = null,
    DateTime? DueDate = null,
    int? AssignedUserId = null
);

// NEW: DTO for updating an existing task
public record UpdateTaskDto(
    string Title, 
    string Description, 
    string Priority, 
    int ColumnId,
    DateTime? StartDate = null,
    DateTime? DueDate = null,
    int? AssignedUserId = null
);