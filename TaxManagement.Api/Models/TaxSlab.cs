namespace TaxManagement.Api.Models;

public class TaxSlab
{
    public int Id { get; set; }
    public decimal FromAmount { get; set; }
    public decimal ToAmount { get; set; }
    public decimal RatePercent { get; set; }
}





