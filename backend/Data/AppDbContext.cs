using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<BoardColumn> BoardColumns { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
    
    // NEW: The mapping table for User -> Project assignments
    public DbSet<ProjectAssignment> ProjectAssignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tell Entity Framework about the composite key
        modelBuilder.Entity<ProjectAssignment>()
            .HasKey(pa => new { pa.ProjectId, pa.UserId });

        base.OnModelCreating(modelBuilder);
    }
}