using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.ViewModels;

namespace HindPharma.Windows.Views;

public sealed partial class HomePage : Page
{
    private readonly HomeViewModel _vm = new();

    public HomePage()
    {
        InitializeComponent();
        var user = AppSession.Current.User;
        if (user is null)
        {
            Subtitle.Text = "Login is required for protected shop operations.";
            var login = new Button { Content = "Open Login", HorizontalAlignment = HorizontalAlignment.Left };
            login.Click += (_, _) => ContentFrameNavigate(new LoginPage());
            Actions.ItemsSource = new[] { login };
            return;
        }
        Subtitle.Text = $"{user.BusinessName ?? "Hind Pharma"} · {user.Username} · {user.RoleDisplayName}";
        var actions = new List<Button>();
        AddAction(actions, "Daily Calling", "calling", user.Role is "admin" or "manager" or "employee");
        AddAction(actions, "Medical List", "medicals", true);
        AddAction(actions, "Products", "products", true);
        AddAction(actions, "Order", "order", true);
        AddAction(actions, "Manager Dashboard", "manager", user.Role is "admin" or "manager");
        AddAction(actions, "Admin Dashboard", "admin", user.Role == "admin");
        AddAction(actions, "HTG Super Admin", "super_admin", user.Role == "super_admin");
        Actions.ItemsSource = actions;
    }

    private static void AddAction(List<Button> actions, string title, string tag, bool enabled)
    {
        if (!enabled) return;
        var button = new Button { Content = title, Tag = tag, HorizontalAlignment = HorizontalAlignment.Left };
        button.Click += (_, _) => Navigate(tag);
        actions.Add(button);
    }

    private static void Navigate(string tag)
    {
        if (App.MainWindow is null) return;
        var page = tag switch
        {
            "calling" => new DailyCallingPage(),
            "medicals" => new MedicalListPage(),
            "products" => new ProductListPage(),
            "order" => new OrderPage(),
            "manager" => new ManagerDashboardPage(),
            "admin" => new AdminDashboardPage(),
            "super_admin" => new SuperAdminDashboardPage(),
            _ => new HomePage()
        };
        App.MainWindow.ContentFrame.Content = page;
    }

    private void ContentFrameNavigate(Page page) => App.MainWindow!.ContentFrame.Content = page;

    private void Logout_Click(object sender, RoutedEventArgs e)
    {
        _vm.Logout();
        ContentFrameNavigate(new LoginPage());
    }
}
