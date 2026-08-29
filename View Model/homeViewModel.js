const HomeViewModel = {
    initialize() {
        const pageTitle = document.title;
        if (!pageTitle) {
            document.title = 'Hind Pharma';
        }
    }
};

HomeViewModel.initialize();
