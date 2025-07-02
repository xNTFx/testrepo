namespace backend.Models;

public class TodoDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Completed { get; set; } = false;
    public DateTime CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
