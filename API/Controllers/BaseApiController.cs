﻿using Microsoft.AspNetCore.Mvc;
using API.RequestHelpers;
using Core.Interfaces;
using Core.Entities;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected async Task<ActionResult> CreatePagedResult<T>(IGenericRepository<T> repository,
        ISpecification<T> specification, int pageIndex, int pageSize) where T : BaseEntity
    {
        var items = await repository.GetAllWithSpecAsync(specification);
        var count = await repository.CountAsync(specification);

        var pagination = new Pagination<T>(pageIndex, pageSize, count, items);

        return Ok(pagination);
    }

    protected async Task<ActionResult> CreatePagedResult<T, TDto>(IGenericRepository<T> repository,
        ISpecification<T> specification, int pageIndex, int pageSize, Func<T, TDto> toDto)
        where T : BaseEntity, IDtoConvertible
    {
        var items = await repository.GetAllWithSpecAsync(specification);
        var count = await repository.CountAsync(specification);

        var dtoItems = items.Select(toDto).ToList();

        var pagination = new Pagination<TDto>(pageIndex, pageSize, count, dtoItems);

        return Ok(pagination);
    }
}
