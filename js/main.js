
/**
 * Main application entry point
 * Initializes all modules
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('TodoApp available:', typeof TodoApp);
    
    // Initialize all modules
    if (typeof UIEffects !== 'undefined') {
        UIEffects.init();
        console.log('UIEffects initialized');
    }
    
    if (typeof FormValidator !== 'undefined') {
        FormValidator.init();
        console.log('FormValidator initialized');
    }
    
    if (typeof CalendarApp !== 'undefined') {
        CalendarApp.init();
        console.log('CalendarApp initialized');
    }
    
    if (typeof TodoApp !== 'undefined') {
        TodoApp.init();
        console.log('TodoApp initialized');
    } else {
        console.error('TodoApp is not defined!');
    }
    
    console.log('Application initialized successfully');
});
