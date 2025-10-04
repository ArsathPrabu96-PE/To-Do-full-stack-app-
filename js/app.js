
/**
 * Main application entry point
 * Initializes all modules and sets up the application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Helpers; // Make sure Helpers is available first as other modules depend on it
    
    // Initialize UI components
    UIController.init();
    AnimationEffects.init();
    
    // Initialize application features
    if (document.getElementById('todo-list')) {
        TodoApp.init();
    }
    
    if (document.querySelector('.calendar-container')) {
        CalendarApp.init();
    }
    
    if (document.getElementById('contact-form')) {
        FormValidator.init();
    }
    
    // Log initialization complete
    console.log('Application initialized successfully');
});

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        const isDarkTheme = document.body.classList.toggle('dark-theme');
        
        // Update toggle button icon
        if (isDarkTheme) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
        
        // Add animation effect
        if (typeof AnimationEffects !== 'undefined') {
            AnimationEffects.animateElement(document.body, 'theme-transition', true);
        }
    });
}

/**
 * Setup mobile navigation menu
 */
function setupMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!menuToggle || !mobileNav) return;
    
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        
        // Update toggle button
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        // Update toggle icon
        if (isOpen) {
            menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (mobileNav.classList.contains('open') && 
            !mobileNav.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            mobileNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}
