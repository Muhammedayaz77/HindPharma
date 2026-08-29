const HomeViewModel = {
    websiteUrl: 'https://muhammedayaz77.github.io/HindPharma/',

    initialize() {
        const pageTitle = document.title;
        if (!pageTitle) document.title = 'Hind Pharma';
        this.setupQrCode();
        this.setupPdfDownload();
    },

    setupQrCode() {
        const qrElement = document.getElementById('hindPharmaQr');
        if (!qrElement || typeof QRCode === 'undefined') return;
        qrElement.innerHTML = '';
        new QRCode(qrElement, {
            text: this.websiteUrl,
            width: 240,
            height: 240,
            correctLevel: QRCode.CorrectLevel.H
        });
    },

    setupPdfDownload() {
        const button = document.getElementById('downloadQr');
        if (!button) return;
        button.addEventListener('click', () => this.downloadQrPdf());
    },

    async downloadQrPdf() {
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
        pdf.setFontSize(13);
        pdf.text('Scan to open the Hind Pharma website', pageWidth / 2, 47, { align: 'center' });
        pdf.addImage(qrCanvas.toDataURL('image/png'), 'PNG', x, 60, qrSize, qrSize);
        pdf.setFontSize(11);
        pdf.text(this.websiteUrl, pageWidth / 2, 165, { align: 'center' });
        pdf.save('Hind-Pharma-Barcode.pdf');
    }
};

HomeViewModel.initialize();
