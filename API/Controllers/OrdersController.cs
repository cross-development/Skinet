using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Entities.OrderAggregate;
using Core.Specifications;
using Core.Interfaces;
using Core.Entities;
using API.Extensions;
using API.DTOs;

namespace API.Controllers;

[Authorize]
public class OrdersController(ICartService cartService, IUnitOfWork unitOfWork) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto createOrderDto)
    {
        var email = User.GetEmail();

        var cart = await cartService.GetCartAsync(createOrderDto.CartId);

        if (cart == null)
        {
            return BadRequest("Cart not found");
        }

        if (cart.PaymentIntentId == null)
        {
            return BadRequest("No payment intent for this order");
        }

        var items = new List<OrderItem>();

        foreach (var item in cart.Items)
        {
            var productItem = await unitOfWork.Repository<Product>().GetByIdAsync(item.ProductId);

            if (productItem == null)
            {
                return BadRequest("Problem with the order");
            }

            var itemOrdered = new ProductItemOrdered
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                PictureUrl = item.PictureUrl
            };

            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };

            items.Add(orderItem);
        }

        var deliveryMethod = await unitOfWork.Repository<DeliveryMethod>()
            .GetByIdAsync(createOrderDto.DeliveryMethodId);

        if (deliveryMethod == null)
        {
            return BadRequest("No delivery method selected");
        }

        var order = new Order
        {
            OrderItems = items,
            DeliveryMethod = deliveryMethod,
            ShippingAddress = createOrderDto.ShippingAddress,
            Subtotal = items.Sum(item => item.Price * item.Quantity),
            PaymentSummary = createOrderDto.PaymentSummary,
            PaymentIntentId = cart.PaymentIntentId,
            BuyerEmail = email
        };

        unitOfWork.Repository<Order>().Add(order);

        var wasSuccessfullySaved = await unitOfWork.Complete();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem creating order");
        }

        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
    {
        var spec = new OrderSpecification(User.GetEmail());

        var orders = await unitOfWork.Repository<Order>().GetAllWithSpecAsync(spec);

        var ordersToReturn = orders.Select(order => order.ToDto()).ToList();

        return Ok(ordersToReturn);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(User.GetEmail(), id);

        var order = await unitOfWork.Repository<Order>().GetEntityWithSpecAsync(spec);

        if (order == null)
        {
            return NotFound();
        }

        var orderToReturn = order.ToDto();

        return Ok(orderToReturn);
    }
}
