using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController(ITodoService todoService) : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult> CreateTodo(TodoRequestDto request)
        {
            if (request.Name is null)
                return BadRequest("Name is required");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("Invalid or missing user ID in claims");

            var todo = await todoService.CreateTodoAsync(userId, request.Name);

            if (todo is null)
                return NotFound("User not found");

            return Ok(todo);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetTodos()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("Invalid or missing user ID in claims");

            var todos = await todoService.GetTodosAsync(userId);

            return Ok(todos);
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteTodo(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("Invalid or missing user ID in claims");

            var deletedTodoId = await todoService.DeleteTodoAsync(userId, id);

            if (deletedTodoId is null)
                return NotFound("Todo not found");

            return Ok(deletedTodoId);
        }
    }
}
