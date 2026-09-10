using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.Models;
using HindPharma.Windows.Services;

namespace HindPharma.Windows.Views;

public sealed partial class MedicalListPage : Page
{
    private readonly ApiClient _api = new();
    private List<Medical> _medicals = new();

    public MedicalListPage()
    {
        InitializeComponent();
        Loaded += async (_, _) => await LoadAsync();
    }

    private async Task LoadAsync()
    {
        if (AppSession.Current.User is not { } user) return;
        try
        {
            _medicals = await _api.GetMedicalsAsync(user, SearchBox.Text ?? string.Empty);
            MedicalList.ItemsSource = _medicals;
        }
        catch (Exception ex) { ShowError(ex.Message); }
    }

    private async void Search_Click(object sender, RoutedEventArgs e) => await LoadAsync();
    private async void Search_KeyDown(object sender, Microsoft.UI.Xaml.Input.KeyRoutedEventArgs e)
    {
        if (e.Key == Windows.System.VirtualKey.Enter) await LoadAsync();
    }

    private void Select_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button { Tag: int id })
        {
            var selected = _medicals.FirstOrDefault(m => m.Id == id);
            if (selected is null) return;
            AppSession.Current.SelectedMedical = selected;
            App.MainWindow!.ContentFrame.Content = new ProductListPage();
        }
    }

    private void ShowError(string message)
    {
        Info.Severity = InfoBarSeverity.Error;
        Info.Message = message;
        Info.IsOpen = true;
    }
}
