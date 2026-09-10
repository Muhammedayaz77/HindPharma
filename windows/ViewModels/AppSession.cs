using HindPharma.Windows.Models;

namespace HindPharma.Windows.ViewModels;

public static class AppSession
{
    public static SessionState Current { get; } = new();
}

public sealed class SessionState
{
    public SessionUser? User { get; set; }
    public Medical? SelectedMedical { get; set; }
    public List<CartItem> Cart { get; } = new();
}
