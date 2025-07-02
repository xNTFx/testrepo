using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public class Todo
{
    public Guid Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public bool Completed { get; set; } = false;
    public DateTime CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
