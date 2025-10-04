
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

    // --- Auth UI handling ---
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailSpan = document.getElementById('user-email');

    function updateAuthUI(){
        const token = localStorage.getItem('token');
        if(token){
            // try decode simple payload to show email if present
            try{
                const payload = JSON.parse(atob(token.split('.')[1]));
                userEmailSpan.textContent = payload.email || '';
            }catch(e){ userEmailSpan.textContent = '' }
            userEmailSpan.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            userEmailSpan.classList.add('hidden');
            logoutBtn.classList.add('hidden');
        }
    }

    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            localStorage.removeItem('token');
            updateAuthUI();
            // Redirect to login page if it exists
            try{ location.href = 'login.html'; }catch(e){ location.reload(); }
        });
    }

    updateAuthUI();
});
