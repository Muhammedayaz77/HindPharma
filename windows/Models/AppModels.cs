namespace HindPharma.Windows.Models;

public sealed record SessionUser(string Id, string Username, string Role, string? AdminId, string? BusinessName, string? SubscriptionExpiry, string Token)
{
    public string RoleDisplayName => Role switch
    {
        "super_admin" => "HTG Super Admin",
        "admin" => "Admin",
        "manager" => "Manager",
        _ => "Employee"
    };
}

public sealed record Medical(int Id, string Name, string? Area, string? Phone, bool IsActive = true);
public sealed record Product(int Id, string? ProductId, string? Code, string Name, string? Unit, double? Mrp, string? Formula, string? Company, string? Image);
public sealed record CartItem(Product Product, int Quantity);
public sealed record CallingMedical(int Id, string Name, string? Phone, string? Area, bool IsCall, bool? IsPick, bool? IsNotPick);
