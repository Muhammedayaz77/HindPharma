using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.Models;
using HindPharma.Windows.Services;

namespace HindPharma.Windows.Views;

public sealed partial class ProductListPage : Page
{
    private readonly ApiClient _api = new();
    private List<Product> _products = new();

    public ProductListPage()
    {
        InitializeComponent();
        Loaded += async (_, _) =>
        {
            MedicalLabel.Text = AppSession.Current.SelectedMedical is { } m ? $"Medical: {m.Name}" : "No medical selected";
            await LoadAsync();
        };
    }

    private async Task LoadAsync()
    {
        if (AppSession.Current.User is not { } user) return;
        try { _products = await _api.GetProductsAsync(user, SearchBox.Text ?? string.Empty); ProductsList.ItemsSource = _products; }
        catch (Exception ex) { ShowError(ex.Message); }
    }

    private async void Search_Click(object sender, RoutedEventArgs e) => await LoadAsync();

    private void Add_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { Tag: int id }) return;
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product is null) return;
        var existing = AppSession.Current.Cart.FirstOrDefault(i => i.Product.Id == id);
        var item = existing is null ? new CartItem(product, 1) : existing with { Quantity = existing.Quantity + 1 };
        if (existing is not null) AppSession.Current.Cart.Remove(existing);
        AppSession.Current.Cart.Add(item);
        Info.Severity = InfoBarSeverity.Success; Info.Message = $"Added {product.Name}."; Info.IsOpen = true;
    }

    private void Continue_Click(object sender, RoutedEventArgs e)
    {
        if (AppSession.Current.SelectedMedical is null) { ShowError("Select a medical first."); return; }
        if (AppSession.Current.Cart.Count == 0) { ShowError("Select at least one product."); return; }
        App.MainWindow!.ContentFrame.Content = new OrderPage();
    }

    private void Back_Click(object sender, RoutedEventArgs e) => App.MainWindow!.ContentFrame.Content = new MedicalListPage();

    private void ShowError(string message) { Info.Severity = InfoBarSeverity.Error; Info.Message = message; Info.IsOpen = true; }
}
