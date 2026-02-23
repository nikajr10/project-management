using System.Text.Json.Serialization;
namespace backend.Models;
public class BoardColumn {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int ProjectId { get; set; }
    [JsonIgnore] public Project? Project { get; set; }
    public List<TaskItem> Tasks { get; set; } = new();
}