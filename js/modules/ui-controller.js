
/**
 * UI Controller module
 * Handles UI interactions and updates
 */
const UIController = {
    init() {
        this.setupShowMoreButton();
        this.setupMobileMenu();
        this.setupThemeToggle();
    },
    
    setupShowMoreButton() {
        const showMoreBtn = document.getElementById('show-more-btn');
        const extraInfo = document.getElementById('extra-info');
        
        if (!showMoreBtn || !extraInfo) return;
        
        showMoreBtn.addEventListener('click', () => {
            const isHidden = extraInfo.classList.contains('hidden');
            extraInfo.classList.toggle('hidden');
            
            // Update button text and icon
            if (isHidden) {
                showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
            } else {
                showMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show More';
            }
        });
    },
    
    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const nav = document.querySelector('nav');
        
        if (!menuToggle || !nav) return;
        
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Update aria-expanded attribute for accessibility
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (nav.classList.contains('active') && 
                !nav.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    },
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (!themeToggle) return;
        
        // Check for saved theme preference or respect OS preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to light theme');
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to dark theme');
            }
        });
    },
    
    /**
     * Update the page title
     * @param {string} title - New page title
     */
    updatePageTitle(title) {
        document.title = title ? `${title} - Arsath Prabu` : 'Arsath Prabu | AI Full Stack Developer';
    },
    
    /**
     * Show loading indicator
     * @param {HTMLElement} container - Container to show loading in
     * @param {string} message - Optional loading message
     */
    showLoading(container, message = 'Loading...') {
        if (!container) return;
        
        const loader = Helpers.createElement('div', { className: 'loader-container' }, [
            Helpers.createElement('div', { className: 'loader' }),
            Helpers.createElement('p', {}, message)
        ]);
        
        container.innerHTML = '';
        container.appendChild(loader);
    },
    
    /**
     * Hide loading indicator
     * @param {HTMLElement} container - Container with loading indicator
     */
    hideLoading(container) {
        if (!container) return;
        
        const loader = container.querySelector('.loader-container');
        if (loader) {
            loader.remove();
        }
    }
};
