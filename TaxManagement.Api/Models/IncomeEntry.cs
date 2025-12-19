namespace TaxManagement.Api.Models;

public class IncomeEntry
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }

    public Guid TaxpayerId { get; set; }
    public Taxpayer? Taxpayer { get; set; }
}





