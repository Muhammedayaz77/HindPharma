using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.Models;
using HindPharma.Windows.Services;

namespace HindPharma.Windows.Views;

public sealed partial class DailyCallingPage : Page
{
    private readonly ApiClient _api = new();
    private List<CallingMedical> _items = new();

    public DailyCallingPage()
    {
        InitializeComponent();
        Loaded += async (_, _) => await LoadAsync();
    }

    private async Task LoadAsync()
    {
        if (AppSession.Current.User is not { } user) return;
        try { _items = await _api.GetTodayCallingAsync(user); CallingList.ItemsSource = _items; }
        catch (Exception ex) { ShowError(ex.Message); }
    }

    private async void Call_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { Tag: int id } || AppSession.Current.User is not { } user) return;
        try
        {
            await _api.RecordCallAsync(user, id);
            var item = _items.FirstOrDefault(x => x.Id == id);
            if (item is not null) Info.Message = $"Call recorded for {item.Name}.";
            Info.Severity = InfoBarSeverity.Success; Info.IsOpen = true;
            await LoadAsync();
        }
        catch (Exception ex) { ShowError(ex.Message); }
    }

    private async void Status_Changed(object sender, SelectionChangedEventArgs e)
    {
        if (sender is not ComboBox combo || combo.SelectedItem is not ComboBoxItem selected || selected.Tag is not string status || status == "none") return;
        if (combo.Tag is not int id || AppSession.Current.User is not { } user) return;
        try
        {
            await _api.SetCallStatusAsync(user, id, status == "picked");
            Info.Severity = InfoBarSeverity.Success; Info.Message = "Call status updated."; Info.IsOpen = true;
        }
        catch (Exception ex) { ShowError(ex.Message); }
        finally { combo.SelectedIndex = 0; }
    }

    private void ShowError(string message) { Info.Severity = InfoBarSeverity.Error; Info.Message = message; Info.IsOpen = true; }
}
