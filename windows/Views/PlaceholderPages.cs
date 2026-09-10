using Microsoft.UI.Xaml.Controls;

namespace HindPharma.Windows.Views;

// Kept separate from DashboardPages so each navigation target has a concrete Page type.
public sealed class PlaceholderPage : Page
{
    public PlaceholderPage(string title)
    {
        Content = new TextBlock
        {
            Text = title,
            FontSize = 28,
            Margin = new Microsoft.UI.Xaml.Thickness(32)
        };
    }
}
