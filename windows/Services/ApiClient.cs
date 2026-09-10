using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using HindPharma.Windows.Models;

namespace HindPharma.Windows.Services;

public sealed class ApiClient
{
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    public string BaseUrl { get; }

    public ApiClient(string? baseUrl = null)
    {
        BaseUrl = (baseUrl ?? Environment.GetEnvironmentVariable("HIND_PHARMA_API_URL") ?? "http://127.0.0.1:8000/api").TrimEnd('/');
    }

    private void Authorize(string token)
    {
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<SessionUser> LoginAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        using var response = await _http.PostAsJsonAsync($"{BaseUrl}/login", new { username, password }, JsonOptions, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            try { throw new InvalidOperationException(JsonDocument.Parse(body).RootElement.GetProperty("detail").GetString()); }
            catch (KeyNotFoundException) { throw new InvalidOperationException("Login failed."); }
        }
        var json = JsonDocument.Parse(body).RootElement;
        return new SessionUser(
            json.GetProperty("id").ToString(), json.GetProperty("username").GetString() ?? username,
            json.GetProperty("role").GetString() ?? "employee",
            json.TryGetProperty("admin_id", out var admin) && admin.ValueKind != JsonValueKind.Null ? admin.ToString() : null,
            json.TryGetProperty("business_name", out var business) && business.ValueKind != JsonValueKind.Null ? business.GetString() : null,
            json.TryGetProperty("subscription_expiry", out var expiry) && expiry.ValueKind != JsonValueKind.Null ? expiry.GetString() : null,
            json.GetProperty("token").GetString() ?? string.Empty);
    }

    public async Task<List<Medical>> GetMedicalsAsync(SessionUser user, string search = "", CancellationToken ct = default)
    {
        Authorize(user.Token);
        var url = $"{BaseUrl}/medicals?search={Uri.EscapeDataString(search)}";
        return await GetListAsync<Medical>(url, ct);
    }

    public async Task<List<Product>> GetProductsAsync(SessionUser user, string search = "", CancellationToken ct = default)
    {
        Authorize(user.Token);
        var url = $"{BaseUrl}/products?search={Uri.EscapeDataString(search)}";
        return await GetListAsync<Product>(url, ct);
    }

    public async Task<List<CallingMedical>> GetTodayCallingAsync(SessionUser user, CancellationToken ct = default)
    {
        Authorize(user.Token);
        return await GetListAsync<CallingMedical>($"{BaseUrl}/calling/today", ct);
    }

    public async Task RecordCallAsync(SessionUser user, int medicalId, CancellationToken ct = default)
    {
        Authorize(user.Token);
        using var response = await _http.PostAsync($"{BaseUrl}/calling/{medicalId}/call", null, ct);
        await EnsureSuccessAsync(response, ct);
    }

    public async Task SetCallStatusAsync(SessionUser user, int medicalId, bool picked, CancellationToken ct = default)
    {
        Authorize(user.Token);
        using var response = await _http.PatchAsJsonAsync($"{BaseUrl}/calling/{medicalId}/status", new { is_pick = picked }, JsonOptions, ct);
        await EnsureSuccessAsync(response, ct);
    }

    public async Task SubmitOrderAsync(SessionUser user, int? medicalId, IEnumerable<CartItem> items, CancellationToken ct = default)
    {
        Authorize(user.Token);
        var payload = new
        {
            medical_id = medicalId,
            items = items.Select(i => new { product_id = i.Product.Id, quantity = i.Quantity, price = i.Product.Mrp })
        };
        using var response = await _http.PostAsJsonAsync($"{BaseUrl}/orders", payload, JsonOptions, ct);
        await EnsureSuccessAsync(response, ct);
    }

    public async Task<List<T>> GetListAsync<T>(string url, CancellationToken ct)
    {
        using var response = await _http.GetAsync(url, ct);
        await EnsureSuccessAsync(response, ct);
        return await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions, ct) ?? new List<T>();
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken ct)
    {
        if (response.IsSuccessStatusCode) return;
        var body = await response.Content.ReadAsStringAsync(ct);
        string message = "Request failed.";
        try { message = JsonDocument.Parse(body).RootElement.GetProperty("detail").GetString() ?? message; } catch { }
        throw new InvalidOperationException(message);
    }
}
