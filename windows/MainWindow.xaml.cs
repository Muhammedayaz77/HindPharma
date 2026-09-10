using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using HindPharma.Windows.ViewModels;
using HindPharma.Windows.Views;

namespace HindPharma.Windows;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        Title = "Hind Pharma";
        Navigate("home");
    }

    private void NavView_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
    {
        if (args.SelectedItem is NavigationViewItem item && item.Tag is string tag)
            Navigate(tag);
    }

    private void Navigate(string tag)
    {
        var session = AppSession.Current.User;
        if (tag is "admin" && session?.Role != "admin") return;
        if (tag is "manager" && session?.Role is not ("admin" or "manager")) return;
        if (tag is "super_admin" && session?.Role != "super_admin") return;
        if (session is null && tag != "home") return;

        ContentFrame.Content = tag switch
        {
            "home" => new HomePage(),
            "calling" => new DailyCallingPage(),
            "medicals" => new MedicalListPage(),
            "products" => new ProductListPage(),
            "order" => new OrderPage(),
            "manager" => new ManagerDashboardPage(),
            "admin" => new AdminDashboardPage(),
            "super_admin" => new SuperAdminDashboardPage(),
            _ => new HomePage()
        };
    }
}
