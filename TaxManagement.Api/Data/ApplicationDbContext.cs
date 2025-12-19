using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Taxpayer> Taxpayers => Set<Taxpayer>();
    public DbSet<IncomeEntry> IncomeEntries => Set<IncomeEntry>();
    public DbSet<TaxSlab> TaxSlabs => Set<TaxSlab>();
    public DbSet<TaxCalculation> TaxCalculations => Set<TaxCalculation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Taxpayer>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Cnic).IsRequired().HasMaxLength(20);
            entity.Property(t => t.Contact).HasMaxLength(50);

            entity.HasMany(t => t.IncomeEntries)
                .WithOne(i => i.Taxpayer!)
                .HasForeignKey(i => i.TaxpayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<IncomeEntry>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.Type).IsRequired().HasMaxLength(100);
            entity.Property(i => i.Amount).HasColumnType("numeric(18,2)");
        });

        builder.Entity<TaxSlab>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.FromAmount).HasColumnType("numeric(18,2)");
            entity.Property(s => s.ToAmount).HasColumnType("numeric(18,2)");
            entity.Property(s => s.RatePercent).HasColumnType("numeric(5,2)");
        });

        builder.Entity<TaxCalculation>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.TotalIncome).HasColumnType("numeric(18,2)");
            entity.Property(c => c.TaxAmount).HasColumnType("numeric(18,2)");
            entity.HasOne(c => c.Taxpayer)
                .WithMany()
                .HasForeignKey(c => c.TaxpayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}





