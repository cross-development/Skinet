using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities.OrderAggregate;
using Core.Specifications;
using Core.Interfaces;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unitOfWork) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<Order>> GetOrders([FromQuery] OrderSpecificationParams orderSpecificationParams)
    {
        var specification = new OrderSpecification(orderSpecificationParams);

        var orderRepository = unitOfWork.Repository<Order>();

        return await CreatePagedResult(orderRepository,
            specification, orderSpecificationParams.PageIndex, orderSpecificationParams.PageSize);
    }
}
