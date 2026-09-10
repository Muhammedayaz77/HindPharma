using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.ViewModels;

namespace HindPharma.Windows.Views;

public sealed partial class LoginPage : Page
{
    private readonly HomeViewModel _vm = new();
    public LoginPage() => InitializeComponent();

    private async void Login_Click(object sender, RoutedEventArgs e)
    {
        ErrorBar.IsOpen = false;
        LoginButton.IsEnabled = false;
        try
        {
            _vm.Username = UsernameBox.Text;
            _vm.Password = PasswordBox.Password;
            if (await _vm.LoginAsync())
            {
                if (App.MainWindow is not null)
                    App.MainWindow.ContentFrame.Content = new HomePage();
                return;
            }
            ErrorBar.Message = _vm.ErrorMessage ?? "Unable to login.";
            ErrorBar.IsOpen = true;
        }
        catch (Exception ex)
        {
            ErrorBar.Message = ex.Message;
            ErrorBar.IsOpen = true;
        }
        finally { LoginButton.IsEnabled = true; }
    }
}
