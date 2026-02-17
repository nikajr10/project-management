namespace backend.DTOs;

// Used when dragging a task
public record MoveTaskDto(int TaskId, int TargetColumnId, int NewPosition);
public record CreateTaskDto(string Title, string Description, string Priority, int ColumnId);