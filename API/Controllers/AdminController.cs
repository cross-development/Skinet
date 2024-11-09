using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities.OrderAggregate;
using Core.Specifications;
using Core.Interfaces;
using API.Extensions;
using API.DTOs;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unitOfWork) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<Order>>> GetOrders([FromQuery] OrderSpecificationParams orderSpecificationParams)
    {
        var specification = new OrderSpecification(orderSpecificationParams);

        var orderRepository = unitOfWork.Repository<Order>();

        return await CreatePagedResult(orderRepository,
            specification, orderSpecificationParams.PageIndex, orderSpecificationParams.PageSize,
            order => order.ToDto());
    }

    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var specification = new OrderSpecification(id);

        var order = await unitOfWork.Repository<Order>().GetEntityWithSpecAsync(specification);

        if (order == null)
        {
            return BadRequest("No order with that id");
        }

        return Ok(order.ToDto());
    }
}
