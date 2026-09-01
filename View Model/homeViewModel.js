import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-4';

const HomeViewModel = {
    paymentVpa: 'HINDPHARMA2022@SBI',
    paymentName: 'Hind Pharma',

    initialize() {
        const session = TempSessionService.get();
        this.setupLoginState(session);
        this.setupRoleDashboard(session);
        this.setupPaymentQrCode();
        this.setupPdfDownload();
        TempSessionService.startExpiryWatcher(() => location.reload());
    },

    setupLoginState(session) {
        const navLogin = document.getElementById('homeLogin');
        const productLogin = document.getElementById('homeProductButton');
        if (!navLogin || !productLogin) return;
        if (session) {
            navLogin.textContent = 'LOGOUT';
            navLogin.href = '#';
            navLogin.onclick = event => {
                event.preventDefault();
                TempSessionService.clear();
                location.reload();
            };
            productLogin.textContent = 'CONTINUE TO MEDICALS →';
            productLogin.href = 'medical.html';
        } else {
            navLogin.textContent = 'LOGIN';
            navLogin.href = 'login.html';
            navLogin.onclick = null;
            productLogin.textContent = 'LOGIN TO VIEW PRODUCTS →';
            productLogin.href = 'login.html';
        }
    },

    setupRoleDashboard(session) {
        const main = document.querySelector('main.wrap');
        const qrCard = document.querySelector('.qrCard');
        if (!main || !qrCard || !session) return;

        const roleConfig = {
            super_admin: { title: 'Super Admin Dashboard', text: 'Manage all Hind Pharma tenants and system access.', href: 'super-admin.html', button: 'OPEN SUPER ADMIN →' },
            admin: { title: 'Admin Dashboard', text: 'Manage your business, users, medicals, products and calling reports.', href: 'admin.html', button: 'OPEN ADMIN DASHBOARD →' },
            manager: { title: 'Manager Dashboard', text: 'Manage employees, medicals, products and orders.', href: 'manager.html', button: 'OPEN MANAGER DASHBOARD →' },
            employee: { title: 'Employee Workspace', text: 'Open Daily Calling List and manage your assigned calling work.', href: 'employee.html', button: 'OPEN EMPLOYEE WORKSPACE →' }
        };
        const config = roleConfig[session.role];
        if (!config) return;

        const existing = document.getElementById('roleDashboardCard');
        if (existing) existing.remove();
        const section = document.createElement('section');
        section.id = 'roleDashboardCard';
        section.className = 'card adminDashboardCard';
        section.innerHTML = `<div><div class="eyebrow">${session.role.replace('_', ' ').toUpperCase()}</div><h2>${config.title}</h2><p>${config.text}</p></div><a class="btn adminButton" href="${config.href}">${config.button}</a>`;
        main.insertBefore(section, qrCard);
    },

    setupPaymentQrCode() {
        const qrElement = document.getElementById('hindPharmaQr');
        if (!qrElement || typeof QRCode === 'undefined') return;
        qrElement.innerHTML = '';
        new QRCode(qrElement, { text: `upi://pay?pa=${encodeURIComponent(this.paymentVpa)}&pn=${encodeURIComponent(this.paymentName)}&cu=INR`, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.H });
    },

    setupPdfDownload() {
        const button = document.getElementById('downloadQr');
        if (!button) return;
        button.addEventListener('click', () => {
            if (!window.jspdf || !window.jspdf.jsPDF) return;
            const canvas = document.querySelector('#hindPharmaQr canvas');
            if (!canvas) return;
            const pdf = new window.jspdf.jsPDF();
            pdf.text('Hind Pharma - UPI Payment QR', 20, 20);
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 35, 30, 140, 140);
            pdf.text(`UPI: ${this.paymentVpa}`, 20, 185);
            pdf.save('hind-pharma-payment-qr.pdf');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => HomeViewModel.initialize());
