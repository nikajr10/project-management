using System.Text.Json.Serialization;

namespace backend.Models;

public class BoardColumn
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // "Todo", "In Progress", "Done"
    public int OrderIndex { get; set; } // To keep columns in order (0, 1, 2)
    
    public int ProjectId { get; set; }
    [JsonIgnore] // Prevent infinite loops in JSON
    public Project? Project { get; set; }
    
    public List<TaskItem> Tasks { get; set; } = new();
}