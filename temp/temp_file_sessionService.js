const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const SESSION_VERSION = '3';
const SESSION_KEYS = ['hindPharmaUser','hindPharmaRole','hindPharmaToken','hindPharmaLoginTime','hindPharmaLoginAt','hindPharmaSessionVersion','hindPharmaAdminId','hindPharmaBusinessName','hindPharmaSubscriptionExpiry'];
const VALID_ROLES = ['super_admin','admin','manager','employee'];

export const TempSessionService = {
  save(user) {
    const loginTime = Date.now();
    localStorage.setItem('hindPharmaUser', user.username);
    localStorage.setItem('hindPharmaRole', user.role || 'employee');
    localStorage.setItem('hindPharmaToken', user.token);
    localStorage.setItem('hindPharmaLoginTime', String(loginTime));
    localStorage.setItem('hindPharmaSessionVersion', SESSION_VERSION);
    if (user.admin_id != null) localStorage.setItem('hindPharmaAdminId', String(user.admin_id));
    if (user.business_name) localStorage.setItem('hindPharmaBusinessName', user.business_name);
    if (user.subscription_expiry) localStorage.setItem('hindPharmaSubscriptionExpiry', user.subscription_expiry);
    sessionStorage.clear();
  },

  get() {
    const token = localStorage.getItem('hindPharmaToken');
    const username = localStorage.getItem('hindPharmaUser');
    const role = localStorage.getItem('hindPharmaRole');
    const loginTime = Number(localStorage.getItem('hindPharmaLoginTime') || 0);
    const version = localStorage.getItem('hindPharmaSessionVersion');
    const validRole = VALID_ROLES.includes(role);
    const validTime = loginTime > 0 && Date.now() - loginTime < SESSION_DURATION_MS;
    const expiry = localStorage.getItem('hindPharmaSubscriptionExpiry');
    const validSubscription = role === 'super_admin' || !expiry || new Date(`${expiry}T23:59:59`) >= new Date();

    if (!token || !username || !validRole || version !== SESSION_VERSION || !validTime || !validSubscription) {
      this.clear();
      return null;
    }
    return {
      token,
      username,
      role,
      admin_id: Number(localStorage.getItem('hindPharmaAdminId') || 0) || null,
      business_name: localStorage.getItem('hindPharmaBusinessName') || '',
      subscription_expiry: expiry || null,
      loginTime
    };
  },

  isLoggedIn() { return Boolean(this.get()); },
  hasRole(...roles) { const session = this.get(); return Boolean(session && roles.includes(session.role)); },
  isSuperAdmin() { return this.hasRole('super_admin'); },
  isAdmin() { return this.hasRole('admin'); },
  isManager() { return this.hasRole('manager'); },
  isEmployee() { return this.hasRole('employee'); },
  canManageCatalog() { return this.hasRole('admin','manager'); },
  canDelete() { return this.hasRole('admin'); },
  canManageUsers() { return this.hasRole('admin','manager'); },
  canViewDashboard() { return this.hasRole('super_admin','admin','manager'); },
  canWorkOrders() { return this.hasRole('admin','manager','employee'); },

  clear() {
    SESSION_KEYS.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
  },

  requireLogin() {
    const session = this.get();
    if (!session) { location.replace('login.html'); return null; }
    return session;
  },

  requireRole(...roles) {
    const session = this.get();
    if (!session || !roles.includes(session.role)) { location.replace('login.html'); return null; }
    return session;
  },

  startExpiryWatcher(onExpire) {
    return setInterval(() => {
      if (!this.get() && typeof onExpire === 'function') onExpire();
    }, 60000);
  }
};
