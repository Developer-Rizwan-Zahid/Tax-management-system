namespace TaxManagement.Api.Models;

public class Taxpayer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Cnic { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;

    public ICollection<IncomeEntry> IncomeEntries { get; set; } = new List<IncomeEntry>();
}





