using System.Security.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Core.Entities;

namespace API.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static async Task<AppUser> GetUserByEmail(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var userToReturn = await userManager.Users.FirstOrDefaultAsync(appUser => appUser.Email == user.GetEmail());

        if (userToReturn == null)
        {
            throw new AuthenticationException("User not found");
        }

        return userToReturn;
    }

    public static async Task<AppUser> GetUserByEmailWithAddress(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var userToReturn = await userManager.Users
            .Include(appUser => appUser.Address)
            .FirstOrDefaultAsync(appUser => appUser.Email == user.GetEmail());

        if (userToReturn == null)
        {
            throw new AuthenticationException("User not found");
        }

        return userToReturn;
    }

    public static string GetEmail(this ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email);

        if (email == null)
        {
            throw new AuthenticationException("Email claim not found");
        }

        return email;
    }
}