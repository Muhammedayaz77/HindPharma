using CommunityToolkit.Mvvm.ComponentModel;
using HindPharma.Windows.Services;

namespace HindPharma.Windows.ViewModels;

public partial class HomeViewModel : ObservableObject
{
    private readonly ApiClient _api = new();
    [ObservableProperty] private string username = string.Empty;
    [ObservableProperty] private string password = string.Empty;
    [ObservableProperty] private string? errorMessage;
    [ObservableProperty] private bool isLoading;

    public async Task<bool> LoginAsync()
    {
        ErrorMessage = null;
        Username = Username.Trim();
        if (string.IsNullOrWhiteSpace(Username)) { ErrorMessage = "Username is required."; return false; }
        if (string.IsNullOrEmpty(Password)) { ErrorMessage = "Password is required."; return false; }
        IsLoading = true;
        try
        {
            AppSession.Current.User = await _api.LoginAsync(Username, Password);
            Password = string.Empty;
            return true;
        }
        catch (Exception ex) { ErrorMessage = ex.Message; return false; }
        finally { IsLoading = false; }
    }

    public void Logout()
    {
        AppSession.Current.User = null;
        AppSession.Current.SelectedMedical = null;
        AppSession.Current.Cart.Clear();
        Username = Password = string.Empty;
        ErrorMessage = null;
    }
}
