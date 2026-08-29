const HomeViewModel = {
    paymentVpa: 'HINDPHARMA2022@SBI',
    paymentName: 'Hind Pharma',
    fssaiNumber: '21521233001380',

    initialize() {
        this.setupPaymentQrCode();
        this.setupPdfDownload();
        this.setupFssaiCopy();
    },

    paymentPayload() {
        return `upi://pay?pa=${encodeURIComponent(this.paymentVpa)}&pn=${encodeURIComponent(this.paymentName)}&cu=INR`;
    },

    setupPaymentQrCode() {
        const qrElement = document.getElementById('hindPharmaQr');
        if (!qrElement || typeof QRCode === 'undefined') return;
        qrElement.innerHTML = '';
        new QRCode(qrElement, {
            text: this.paymentPayload(),
            width: 240,
            height: 240,
            correctLevel: QRCode.CorrectLevel.H
        });
    },

    setupPdfDownload() {
        const button = document.getElementById('downloadQr');
        if (!button) return;
        button.addEventListener('click', () => this.downloadPaymentQrPdf());
    },

    setupFssaiCopy() {
        const card = document.getElementById('fssaiCard');
        if (!card) return;
        const copy = () => this.copyFssaiNumber();
        card.addEventListener('click', copy);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                copy();
            }
        });
    },

    async copyFssaiNumber() {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(this.fssaiNumber);
            } else {
                const helper = document.getElementById('fssaiCopyValue');
                helper.focus();
                helper.select();
                document.execCommand('copy');
                helper.blur();
            }
            const hint = document.getElementById('fssaiHint');
            if (hint) {
                hint.textContent = 'FSSAI number copied';
                window.setTimeout(() => { hint.textContent = 'Tap to select & copy'; }, 1600);
            }
        } catch (error) {
            const hint = document.getElementById('fssaiHint');
            if (hint) hint.textContent = 'Tap and hold to copy';
        }
    },

    downloadPaymentQrPdf() {
        const qrCanvas = document.querySelector('#hindPharmaQr canvas');
        if (!qrCanvas || !window.jspdf?.jsPDF) return;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 90;
        const x = (pageWidth - qrSize) / 2;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.text('HIND PHARMA', pageWidth / 2, 35, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.text('SCAN TO PAY', pageWidth / 2, 48, { align: 'center' });
        pdf.addImage(qrCanvas.toDataURL('image/png'), 'PNG', x, 60, qrSize, qrSize);
        pdf.setFontSize(12);
        pdf.text('UPI: HINDPHARMA2022@SBI', pageWidth / 2, 165, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text('Open your UPI app and scan this QR code to make a payment.', pageWidth / 2, 174, { align: 'center' });
        pdf.save('Hind-Pharma-Payment-QR.pdf');
    }
};

HomeViewModel.initialize();
