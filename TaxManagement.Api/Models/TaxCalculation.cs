namespace TaxManagement.Api.Models;

public class TaxCalculation
{
    public Guid Id { get; set; }
    public Guid TaxpayerId { get; set; }
    public Taxpayer? Taxpayer { get; set; }

    public decimal TotalIncome { get; set; }
    public decimal TaxAmount { get; set; }
    public DateTime CalculatedAt { get; set; }
}





