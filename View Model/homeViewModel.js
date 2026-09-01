import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-6';
import { TenantService } from './tenantService.js?v=20260901-1';

const HomeViewModel = {
  paymentVpa: 'HINDPHARMA2022@SBI',
  paymentName: 'Hind Pharma',
  initialize() {
    const tenant = TenantService.current();
    const session = TempSessionService.get();
    this.applyTenant(tenant);
    this.setupLoginState(session, tenant);
    this.setupRoleActions(session);
    this.setupPaymentQrCode(tenant);
    this.setupPdfDownload(tenant);
    if (session) TempSessionService.startExpiryWatcher(() => location.reload());
  },
  applyTenant(tenant) {
    const logo = tenant.logo || '../Assets/Images/hind-pharma-default.svg';
    ['brandLogo','heroLogo'].forEach(id => { const el = document.getElementById(id); if (el) { el.src = logo; el.alt = `${tenant.business_name} logo`; } });
    document.getElementById('brandName').textContent = tenant.business_name;
    document.getElementById('heroName').textContent = tenant.business_name;
    document.getElementById('heroSubtitle').textContent = tenant.subtitle || 'Pharmaceutical Distributor';
    document.getElementById('heroAddress').textContent = tenant.address || 'Welcome to our shop.';
    document.getElementById('businessEyebrow').textContent = tenant.business_name;
    document.getElementById('businessAddress').textContent = tenant.address || '—';
    document.getElementById('footer').textContent = `${tenant.business_name} • ${tenant.subtitle || 'Pharmaceutical Distributor'}`;
    document.title = tenant.business_name;
    const phone = document.getElementById('businessPhone'); if (phone && tenant.phone) phone.href = `tel:${tenant.phone}`;
    const email = document.getElementById('businessEmail'); if (email && tenant.email) email.href = `mailto:${tenant.email}`;
    this.paymentName = tenant.business_name;
  },
  setupLoginState(session, tenant) {
    const login = document.getElementById('homeLogin');
    const product = document.getElementById('homeProductButton');
    const call = document.getElementById('callShop');
    if (!login || !product) return;
    if (session) {
      login.textContent = `LOGOUT (${session.username})`;
      login.href = '#';
      login.onclick = event => { event.preventDefault(); TempSessionService.clear(); location.reload(); };
      product.textContent = 'MEDICAL LIST →'; product.href = 'medical.html';
    } else {
      login.textContent = 'LOGIN'; login.href = `login.html?shop=${encodeURIComponent(tenant.slug)}`; login.onclick = null;
      product.textContent = 'LOGIN TO VIEW PRODUCTS →'; product.href = `login.html?shop=${encodeURIComponent(tenant.slug)}`;
    }
    if (call && tenant.phone) call.href = `tel:${tenant.phone}`;
  },
  setupRoleActions(session) {
    const card = document.getElementById('roleActions'); const buttons = document.getElementById('roleButtons');
    if (!card || !buttons) return;
    if (!session || session.role === 'super_admin') { card.hidden = true; return; }
    const common = [['DAILY CALLING','daily-calling.html'],['MEDICAL LIST','medical.html']];
    const extras = session.role === 'manager' ? [['MANAGER DASHBOARD','manager.html']] : session.role === 'admin' ? [['ADMIN DASHBOARD','admin.html']] : [];
    buttons.innerHTML = [...common, ...extras].map(([label,href]) => `<a class="btn primary" href="${href}">${label} →</a>`).join('');
    document.getElementById('roleEyebrow').textContent = `${session.role.replace('_',' ').toUpperCase()} • SHOP WORKSPACE`;
    document.getElementById('roleTitle').textContent = `Welcome, ${session.username}`;
    document.getElementById('roleText').textContent = session.role === 'admin' ? 'Employee + Manager work, plus Admin management.' : session.role === 'manager' ? 'Employee work, plus Manager work.' : 'Use the shop Home for your assigned work.';
    card.hidden = false;
  },
  setupPaymentQrCode(tenant) {
    const qr = document.getElementById('hindPharmaQr'); if (!qr || typeof QRCode === 'undefined') return;
    qr.innerHTML = ''; new QRCode(qr, { text:`upi://pay?pa=${encodeURIComponent(tenant.upi || this.paymentVpa)}&pn=${encodeURIComponent(tenant.business_name)}&cu=INR`, width:240, height:240, correctLevel:QRCode.CorrectLevel.H });
    document.getElementById('paymentTitle').textContent = `Pay ${tenant.business_name}`;
  },
  setupPdfDownload(tenant) {
    const button = document.getElementById('downloadQr'); if (!button) return;
    button.onclick = () => { if (!window.jspdf?.jsPDF) return; const canvas=document.querySelector('#hindPharmaQr canvas'); if(!canvas)return; const pdf=new window.jspdf.jsPDF(); pdf.text(`${tenant.business_name} - UPI Payment QR`,20,20); pdf.addImage(canvas.toDataURL('image/png'),'PNG',35,30,140,140); pdf.text(`UPI: ${tenant.upi || this.paymentVpa}`,20,185); pdf.save(`${tenant.slug}-payment-qr.pdf`); };
  }
};
document.addEventListener('DOMContentLoaded', () => HomeViewModel.initialize());
