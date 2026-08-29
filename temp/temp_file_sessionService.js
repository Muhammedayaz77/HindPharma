const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const SESSION_KEYS = ['hindPharmaUser', 'hindPharmaRole', 'hindPharmaToken', 'hindPharmaLoginTime', 'hindPharmaLoginAt'];

export const TempSessionService = {
  save(user) {
    const loginTime = Date.now();
    localStorage.setItem('hindPharmaUser', user.username);
    localStorage.setItem('hindPharmaRole', user.role || 'user');
    localStorage.setItem('hindPharmaToken', user.token);
    localStorage.setItem('hindPharmaLoginTime', String(loginTime));
    localStorage.removeItem('hindPharmaLoginAt');
    sessionStorage.clear();
  },

  get() {
    const token = localStorage.getItem('hindPharmaToken');
    const username = localStorage.getItem('hindPharmaUser');
    const role = localStorage.getItem('hindPharmaRole');
    const loginTime = Number(localStorage.getItem('hindPharmaLoginTime') || 0);
    if (!token || !username || !loginTime || Date.now() - loginTime >= SESSION_DURATION_MS) {
      this.clear();
      return null;
    }
    return { token, username, role: role || 'user', loginTime };
  },

  isLoggedIn() { return Boolean(this.get()); },
  isAdmin() { const session = this.get(); return Boolean(session && session.role === 'admin'); },

  clear() {
    SESSION_KEYS.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
  },

  requireLogin() {
    const session = this.get();
    if (!session) {
      location.replace('login.html');
      return null;
    }
    return session;
  },

  startExpiryWatcher(onExpire) {
    return setInterval(() => { if (!this.get() && typeof onExpire === 'function') onExpire(); }, 60000);
  }
};
