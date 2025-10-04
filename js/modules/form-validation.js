
/**
 * Form validation functionality
 * Handles contact form validation
 */
const FormValidation = {
    contactForm: null,
    emailInput: null,
    emailError: null,
    
    init() {
        this.contactForm = document.getElementById('contact-form');
        
        if (!this.contactForm) return; // Exit if form doesn't exist
        
        this.emailInput = document.getElementById('email');
        this.emailError = document.getElementById('email-error');
        
        // Create email error element if it doesn't exist
        if (!this.emailError) {
            this.emailError = document.createElement('div');
            this.emailError.id = 'email-error';
            this.emailError.className = 'error-message';
            this.emailInput.parentNode.insertBefore(this.emailError, this.emailInput.nextSibling);
        }
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (event) => this.handleFormSubmit(event));
            
            // Optional: Add real-time validation as user types
            if (this.emailInput) {
                this.emailInput.addEventListener('input', () => this.validateEmail());
            }
        }
    },
    
    handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate all fields
        const isValid = this.validateForm();
        
        if (isValid) {
            // Form is valid, submit or process
            alert('Form submitted successfully! (This is a demo)');
            this.contactForm.reset();
        }
    },
    
    validateForm() {
        let isValid = true;
        
        // Email validation
        if (this.emailInput) {
            const isEmailValid = this.validateEmail();
            isValid = isValid && isEmailValid;
        }
        
        // Add other field validations here as needed
        
        return isValid;
    },
    
    validateEmail() {
        if (!this.emailInput || !this.emailError) return true;
        
        const email = this.emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            this.showError(this.emailInput, this.emailError, 'Email is required');
            return false;
        } else if (!emailPattern.test(email)) {
            this.showError(this.emailInput, this.emailError, 'Please enter a valid email address');
            return false;
        } else {
            this.clearError(this.emailInput, this.emailError);
            return true;
        }
    },
    
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },
    
    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
};
