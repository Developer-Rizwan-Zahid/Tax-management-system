using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Services;

public class PdfReportService : IPdfReportService
{
    public byte[] GenerateTaxReportPdf(Taxpayer taxpayer, TaxCalculation calculation)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Size(PageSizes.A4);

                page.Content().Stack(stack =>
                {
                    stack.Item().Text("Tax Report").FontSize(24).Bold();
                    stack.Item().Text($"Taxpayer: {taxpayer.Name}").FontSize(14);
                    stack.Item().Text($"CNIC: {taxpayer.Cnic}");
                    stack.Item().Text($"Contact: {taxpayer.Contact}");
                    stack.Item().Text($"Calculated At: {calculation.CalculatedAt:u}");

                    stack.Spacing(10);

                    stack.Item().Text($"Total Income: {calculation.TotalIncome:C}");
                    stack.Item().Text($"Tax Amount: {calculation.TaxAmount:C}").Bold();
                });
            });
        });

        return document.GeneratePdf();
    }
}





