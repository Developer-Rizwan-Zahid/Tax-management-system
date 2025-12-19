using TaxManagement.Api.Models;

namespace TaxManagement.Api.Services;

public interface ITaxCalculationService
{
    Task<TaxCalculation> CalculateTaxForTaxpayerAsync(Guid taxpayerId, CancellationToken cancellationToken = default);
}





