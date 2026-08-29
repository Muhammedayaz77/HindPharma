const HomeViewModel = {
    paymentVpa: 'HINDPHARMA2022@SBI',
    paymentName: 'Hind Pharma',
    fssaiNumber: '21521233001380',

    initialize() {
        this.setupPaymentQrCode();
        this.setupPdfDownload();
        this.setupFssaiCopy();
        this.setupAdminDashboardButton();
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

    setupAdminDashboardButton() {
        const adminSection = document.getElementById('adminDashboardSection');
        if (!adminSection) return;
        const role = sessionStorage.getItem('hindPharmaRole');
        const token = sessionStorage.getItem('hindPharmaToken');
        adminSection.hidden = !(role === 'admin' && token);
    },

    setupFssaiCopy() {
        const hint = document.getElementById('fssaiHint');
        const value = document.getElementById('fssaiCopyValue');
        if (!hint || !value) return;
        const copy = async () => {
            try { await navigator.clipboard.writeText(this.fssaiNumber); }
            catch (_) { value.select(); document.execCommand('copy'); }
            hint.textContent = 'Copied ✓';
            setTimeout(() => hint.textContent = 'Tap to copy number', 1800);
        };
        hint.addEventListener('click', copy);
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
