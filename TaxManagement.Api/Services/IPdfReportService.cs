using TaxManagement.Api.Models;

namespace TaxManagement.Api.Services;

public interface IPdfReportService
{
    byte[] GenerateTaxReportPdf(Taxpayer taxpayer, TaxCalculation calculation);
}





