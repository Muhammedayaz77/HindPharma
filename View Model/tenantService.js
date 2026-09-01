const TENANT_KEY = 'hindPharmaTenants';
const DEFAULT_TENANT = {
  id: 1,
  slug: 'hind-pharma',
  business_name: 'Hind Pharma',
  subtitle: 'Surgical and Generic Medicine Distributor',
  address: 'Shop No. 2, Tipu Sultan Road, Quadri Colony, Nanded-431604.',
  phone: '9028773301',
  email: 'hindpharma07@gmail.com',
  dl_20b: 'MH-NAN-20B-455829',
  dl_21b: 'MH-NAN-21B-455830',
  fssai: '',
  gstin: '27BFSPA3240L1ZB',
  logo: '../Assets/Images/hind-pharma-default.svg',
  barcode: '',
  is_active: true
};

function read() {
  try { return JSON.parse(localStorage.getItem(TENANT_KEY) || '[]'); }
  catch (_) { return []; }
}
function write(items) { localStorage.setItem(TENANT_KEY, JSON.stringify(items)); }
function slugify(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `shop-${Date.now()}`;
}

export const TenantService = {
  ensureDefaults() {
    const tenants = read();
    if (!tenants.some(t => Number(t.id) === 1)) tenants.unshift(DEFAULT_TENANT);
    write(tenants);
    return tenants;
  },
  all() { return this.ensureDefaults(); },
  findBySlug(slug) { return this.all().find(t => t.slug === String(slug || '').toLowerCase()) || null; },
  currentSlug() {
    const match = location.pathname.match(/\/shop\/([^/]+)/i);
    if (match) return match[1].toLowerCase();
    return new URLSearchParams(location.search).get('shop')?.toLowerCase() || 'hind-pharma';
  },
  current() { return this.findBySlug(this.currentSlug()) || DEFAULT_TENANT; },
  createApplication(data) {
    const tenants = this.all();
    const slugBase = slugify(data.business_name);
    let slug = slugBase; let n = 2;
    while (tenants.some(t => t.slug === slug)) slug = `${slugBase}-${n++}`;
    const application = {
      ...data,
      slug,
      id: Math.max(0, ...tenants.map(t => Number(t.id) || 0)) + 1,
      application_status: 'pending_payment',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };
    tenants.push(application);
    write(tenants);
    return application;
  },
  markPaidAndActivate(id) {
    const tenants = this.all();
    const tenant = tenants.find(t => Number(t.id) === Number(id));
    if (!tenant) throw new Error('Shop application not found.');
    tenant.payment_status = 'paid';
    tenant.payment_id = `PAY-${Date.now()}`;
    tenant.payment_date = new Date().toISOString();
    tenant.application_status = 'active';
    tenant.is_active = true;
    tenant.admin_generated = true;
    tenant.admin_id = tenant.id;
    write(tenants);
    return tenant;
  },
  save(tenant) {
    const tenants = this.all();
    const index = tenants.findIndex(t => Number(t.id) === Number(tenant.id));
    if (index >= 0) tenants[index] = tenant;
    else tenants.push(tenant);
    write(tenants);
    return tenant;
  }
};
