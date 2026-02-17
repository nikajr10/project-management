using System.Text.Json.Serialization;

namespace backend.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium"; // Low, Medium, High
    
    // Drag & Drop Positioning
    public int Position { get; set; } 

    public int ColumnId { get; set; }
    [JsonIgnore]
    public BoardColumn? Column { get; set; }
}