namespace backend.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OwnerId { get; set; } // FK to User
    public List<BoardColumn> Columns { get; set; } = new();
}