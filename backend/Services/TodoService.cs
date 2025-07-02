using backend.Data;
using backend.Entities;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TodoService(AppDbContext context) : ITodoService
{
    public async Task<Todo?> CreateTodoAsync(Guid userId, string name)
    {

        bool userExists = await context.Users.AnyAsync(u => u.Id == userId);

        if (!userExists)
            return null;

        var todo = new Todo
        {
            Name = name,
            UserId = userId,
            CreatedAt = DateTime.Now,
        };

        context.Todos.Add(todo);

        await context.SaveChangesAsync();

        return todo;
    }

    public async Task<Todo[]?> GetTodosAsync(Guid userId)
    {
        return await context.Todos
            .Where(t => t.UserId == userId)
            .ToArrayAsync();
    }

    public async Task<Todo?> PatchTodoCompletionAsync(Guid userId, Guid todoId)
    {
        return null;
    }

    public async Task<Todo?> PatchTodoNameAsync(Guid userId, Guid todoId)
    {
        return null;
    }
    public async Task<Guid?> DeleteTodoAsync(Guid userId, Guid todoId)
    {
        var todo = await context.Todos.FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);

        if (todo is null)
            return null;

        context.Todos.Remove(todo);
        await context.SaveChangesAsync();

        return todo.Id;
    }

}
