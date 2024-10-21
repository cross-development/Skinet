using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderSpecification : BaseSpecification<Order>
{
    public OrderSpecification(string email)
        : base(order => order.BuyerEmail == email)
    {
    }

    public OrderSpecification(string email, int id)
        : base(order => order.BuyerEmail == email && order.Id == id)
    {
    }
}