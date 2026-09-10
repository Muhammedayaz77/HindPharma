using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace HindPharma.Windows.Views;

public sealed partial class DashboardPages : Page
{
    public DashboardPages(string title, string body)
    {
        InitializeComponent();
        TitleText.Text = title;
        BodyText.Text = body;
    }
    private void Back_Click(object sender, RoutedEventArgs e) => App.MainWindow!.ContentFrame.Content = new HomePage();
}

public sealed class ManagerDashboardPage : DashboardPages
{
    public ManagerDashboardPage() : base("Manager Dashboard", "Manager dashboard access is role-protected. Employee functions remain available from the same shop Home.") { }
}

public sealed class AdminDashboardPage : DashboardPages
{
    public AdminDashboardPage() : base("Admin Dashboard", "Admin dashboard is role-protected. Manage shop users and operational data through the tenant-scoped API.") { }
}

public sealed class SuperAdminDashboardPage : DashboardPages
{
    public SuperAdminDashboardPage() : base("HTG Super Admin", "HTG Super Admin is a separate group-level role and never enters a shop Home through the Super Admin flow.") { }
}
