using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService, IConfiguration configuration) : ControllerBase
{

    [HttpPost("register")]
    public async Task<ActionResult> Register(UserDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Invalid request.");

        var user = await authService.RegisterAsync(request);
        if (user == null)
            return BadRequest("User already exists or invalid input.");

        var token = await authService.LoginAsync(request);
        if (token == null)
            return StatusCode(500, "Unexpected error during automatic login.");

        SetAuthCookies(token);

        return Ok(new
        {
            user.Id,
            user.Username,
            Role = user.Role.ToString()
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(UserDto request)
    {
        var result = await authService.LoginAsync(request);
        if (result == null)
            return Unauthorized("Invalid username or password.");

        SetAuthCookies(result);

        return Ok(new
        {
            result.User.Id,
            result.User.Username,
            Role = result.User.Role.ToString()
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        Request.Cookies.TryGetValue("refreshToken", out var refreshTokenFromCookie);

        if (!string.IsNullOrEmpty(refreshTokenFromCookie))
        {
            await authService.LogoutAsync(refreshTokenFromCookie);
        }

        var cookieOptionsForDeletion = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTime.UtcNow.AddDays(-1)
        };

        Response.Cookies.Append("accessToken", string.Empty, cookieOptionsForDeletion);
        Response.Cookies.Append("refreshToken", string.Empty, cookieOptionsForDeletion);

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var hasCookie = Request.Cookies.ContainsKey("accessToken");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!hasCookie)
            return Ok(new { authenticated = false, user = (object?)null });

        if (string.IsNullOrEmpty(userId))
            return Ok(new { authenticated = false, needsRefresh = true });

        return Ok(new
        {
            authenticated = true,
            user = new
            {
                id = userId,
                username = User.FindFirstValue(ClaimTypes.Name),
                role = User.FindFirstValue(ClaimTypes.Role)
            }
        });
    }


    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
        {
            return Unauthorized("Missing refresh token");
        }

        var result = await authService.RefreshTokensAsync(refreshToken);

        if (result is null)
            return Unauthorized("Invalid refresh token.");

        SetAuthCookies(result);
        return Ok("Token refreshed");
    }

    [Authorize]
    [HttpGet]
    public IActionResult AuthenticatedOnlyEndpoint()
    {
        return Ok("You are authenticated");
    }

    [Authorize(Roles = "admin")]
    [HttpGet("admin-only")]
    public IActionResult AdminOnlyEndpoint()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);
        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new
        {
            Id = userId,
            Username = username,
            Role = role
        });
    }

    private void SetAuthCookies(TokenResponseDto token)
    {
        var accessMinutes = configuration.GetValue<int>("AppSettings:AccessTokenLifetimeMinutes");
        var refreshDays = configuration.GetValue<int>("AppSettings:RefreshTokenLifetimeDays");

        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTime.UtcNow.AddMinutes(accessMinutes)
        };

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTime.UtcNow.AddDays(refreshDays)
        };

        Response.Cookies.Append("accessToken", token.AccessToken, accessCookieOptions);
        Response.Cookies.Append("refreshToken", token.RefreshToken, refreshCookieOptions);
    }
}
