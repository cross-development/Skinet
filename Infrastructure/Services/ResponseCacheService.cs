using System.Text.Json;
using StackExchange.Redis;
using Core.Interfaces;

namespace Infrastructure.Services;

public class ResponseCacheService(IConnectionMultiplexer redis) : IResponseCacheService
{
    private readonly IDatabase _database = redis.GetDatabase(1);

    public async Task CacheResponseAsync(string cacheKey, object response, TimeSpan timeToLive)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var serializedResponse = JsonSerializer.Serialize(response, options);

        await _database.StringSetAsync(cacheKey, serializedResponse, timeToLive);
    }

    public async Task<string?> GetCachedResponseAsync(string cacheKey)
    {
        var cacheResponse = await _database.StringGetAsync(cacheKey);

        if (cacheResponse.IsNullOrEmpty)
        {
            return null;
        }

        return cacheResponse;
    }

    public async Task RemoveCacheByPattern(string pattern)
    {
        throw new NotImplementedException();
    }
}