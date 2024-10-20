using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Core.Entities.OrderAggregate;

namespace Infrastructure.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.OwnsOne(item => item.ItemOrdered, navigationBuilder => navigationBuilder.WithOwner());

        builder.Property(item => item.Price).HasColumnType("decimal(18,2)");
    }
}