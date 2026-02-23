namespace backend.Models;

public class ProjectAssignment
{
    public int ProjectId { get; set; }
    public int UserId { get; set; }
    
    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
}