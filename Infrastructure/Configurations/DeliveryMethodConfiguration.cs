using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Core.Entities;

namespace Infrastructure.Configurations;

public class DeliveryMethodConfiguration : IEntityTypeConfiguration<DeliveryMethod>
{
    public void Configure(EntityTypeBuilder<DeliveryMethod> builder)
    {
        builder
            .Property(delivery => delivery.Price)
            .HasColumnType("decimal(18,2)");
    }
}