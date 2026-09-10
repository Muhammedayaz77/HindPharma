using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.Services;

namespace HindPharma.Windows.Views;

public sealed partial class OrderPage : Page
{
    private readonly ApiClient _api = new();
    public OrderPage()
    {
        InitializeComponent();
        Loaded += (_, _) => Refresh();
    }

    private void Refresh()
    {
        var medical = AppSession.Current.SelectedMedical;
        MedicalLabel.Text = medical is null ? "No medical selected" : $"Medical: {medical.Name}";
        CartList.ItemsSource = null;
        CartList.ItemsSource = AppSession.Current.Cart.ToList();
        Total.Text = $"Total: ₹{AppSession.Current.Cart.Sum(i => (i.Product.Mrp ?? 0) * i.Quantity):0.00}";
    }

    private void Back_Click(object sender, RoutedEventArgs e) => App.MainWindow!.ContentFrame.Content = new ProductListPage();

    private async void Submit_Click(object sender, RoutedEventArgs e)
    {
        if (AppSession.Current.User is not { } user || AppSession.Current.SelectedMedical is not { } medical || AppSession.Current.Cart.Count == 0)
        {
            ShowError("Medical and at least one product are required."); return;
        }
        Progress.IsActive = true;
        try
        {
            await _api.SubmitOrderAsync(user, medical.Id, AppSession.Current.Cart);
            AppSession.Current.Cart.Clear();
            Info.Severity = InfoBarSeverity.Success; Info.Message = "Order submitted successfully."; Info.IsOpen = true;
            Refresh();
        }
        catch (Exception ex) { ShowError(ex.Message); }
        finally { Progress.IsActive = false; }
    }

    private void ShowError(string message) { Info.Severity = InfoBarSeverity.Error; Info.Message = message; Info.IsOpen = true; }
}
