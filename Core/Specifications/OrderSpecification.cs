using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderSpecification : BaseSpecification<Order>
{
    public OrderSpecification(string email)
        : base(order => order.BuyerEmail == email)
    {
        AddInclude(order => order.OrderItems);
        AddInclude(order => order.DeliveryMethod);
        AddOrderByDescending(order => order.OrderDate);
    }

    public OrderSpecification(string email, int id)
        : base(order => order.BuyerEmail == email && order.Id == id)
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
    }
}