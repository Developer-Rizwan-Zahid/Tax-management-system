using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Data;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Services;

public class TaxCalculationService : ITaxCalculationService
{
    private readonly ApplicationDbContext _db;

    public TaxCalculationService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<TaxCalculation> CalculateTaxForTaxpayerAsync(Guid taxpayerId, CancellationToken cancellationToken = default)
    {
        var taxpayer = await _db.Taxpayers
            .Include(t => t.IncomeEntries)
            .FirstOrDefaultAsync(t => t.Id == taxpayerId, cancellationToken);

        if (taxpayer == null)
        {
            throw new InvalidOperationException("Taxpayer not found");
        }

        var slabs = await _db.TaxSlabs
            .OrderBy(s => s.FromAmount)
            .ToListAsync(cancellationToken);

        var totalIncome = taxpayer.IncomeEntries.Sum(i => i.Amount);
        var taxAmount = CalculateTax(totalIncome, slabs);

        var calculation = new TaxCalculation
        {
            Id = Guid.NewGuid(),
            TaxpayerId = taxpayerId,
            TotalIncome = totalIncome,
            TaxAmount = taxAmount,
            CalculatedAt = DateTime.UtcNow
        };

        _db.TaxCalculations.Add(calculation);
        await _db.SaveChangesAsync(cancellationToken);

        return calculation;
    }

    private static decimal CalculateTax(decimal income, IEnumerable<TaxSlab> slabs)
    {
        decimal tax = 0;
        var remaining = income;

        foreach (var slab in slabs.OrderBy(s => s.FromAmount))
        {
            if (remaining <= 0) break;

            var slabStart = slab.FromAmount;
            var slabEnd = slab.ToAmount == 0 ? decimal.MaxValue : slab.ToAmount;

            if (income <= slabStart)
            {
                continue;
            }

            var taxableInSlab = Math.Min(remaining, slabEnd - slabStart);
            if (taxableInSlab <= 0) continue;

            tax += taxableInSlab * (slab.RatePercent / 100m);
            remaining -= taxableInSlab;
        }

        return tax;
    }
}





