import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-4';

const HomeViewModel = {
    paymentVpa: 'HINDPHARMA2022@SBI',
    paymentName: 'Hind Pharma',

    initialize() {
        const adminSection = document.getElementById('adminDashboardSection');
        if (adminSection) adminSection.hidden = true;
        const session = TempSessionService.get();
        this.setupLoginState(session);
        this.setupPaymentQrCode();
        this.setupPdfDownload();
        this.setupAdminDashboardButton(session);
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

    setupAdminDashboardButton(session) {
        const adminSection = document.getElementById('adminDashboardSection');
        const adminLink = adminSection?.querySelector('.adminButton');
        const isAdmin = Boolean(session && session.role === 'admin');
        if (!adminSection) return;
        adminSection.hidden = !isAdmin;
        if (adminLink) {
            adminLink.onclick = event => {
                if (!TempSessionService.isAdmin()) {
                    event.preventDefault();
                    adminSection.hidden = true;
                }
            };
        }
    },

    paymentPayload() {
        return `upi://pay?pa=${encodeURIComponent(this.paymentVpa)}&pn=${encodeURIComponent(this.paymentName)}&cu=INR`;
    },

    setupPaymentQrCode() {
        const qrElement = document.getElementById('hindPharmaQr');
        if (!qrElement || typeof QRCode === 'undefined') return;
        qrElement.innerHTML = '';
        new QRCode(qrElement, { text: this.paymentPayload(), width: 240, height: 240, correctLevel: QRCode.CorrectLevel.H });
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
