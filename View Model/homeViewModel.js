import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-3';

const HomeViewModel = {
    paymentVpa: 'HINDPHARMA2022@SBI',
    paymentName: 'Hind Pharma',

    initialize() {
        const session = TempSessionService.get();
        if (session) {
            const destination = session.role === 'super_admin' ? 'super-admin.html' : session.role === 'admin' ? 'admin.html' : session.role === 'manager' ? 'manager.html' : 'employee.html';
            location.replace(destination);
            return;
        }
        this.setupLoginState();
        this.setupPaymentQrCode();
        this.setupPdfDownload();
    },

    setupLoginState() {
        const navLogin = document.getElementById('homeLogin');
        const productLogin = document.getElementById('homeProductButton');
        if (!navLogin || !productLogin) return;
        navLogin.textContent = 'LOGIN';
        navLogin.href = 'login.html';
        productLogin.textContent = 'LOGIN TO VIEW PRODUCTS →';
        productLogin.href = 'login.html';
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
