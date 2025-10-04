/**
 * Form validation functionality
 */
const FormValidator = {
    /**
     * Initialize form validation
     */
    init() {
        const contactForm = document.getElementById('contact-form');
        
        if (contactForm) {
            this.setupContactFormValidation(contactForm);
        }
    },
    
    /**
     * Set up validation for the contact form
     * @param {HTMLFormElement} form - Contact form element
     */
    setupContactFormValidation(form) {
        const emailInput = form.querySelector('#email');
        const nameInput = form.querySelector('#name');
        const messageInput = form.querySelector('#message');
        
        // Create error message elements
        const emailError = this.createErrorElement('email-error');
        const nameError = this.createErrorElement('name-error');
        const messageError = this.createErrorElement('message-error');
        
        // Insert error elements after inputs
        emailInput.parentNode.insertBefore(emailError, emailInput.nextSibling);
        nameInput.parentNode.insertBefore(nameError, nameInput.nextSibling);
        messageInput.parentNode.insertBefore(messageError, messageInput.nextSibling);
        
        // Add input event listeners for real-time validation
        emailInput.addEventListener('input', () => {
            this.validateEmail(emailInput, emailError);
        });
        
        nameInput.addEventListener('input', () => {
            this.validateRequired(nameInput, nameError, 'Please enter your name');
        });
        
        messageInput.addEventListener('input', () => {
            this.validateRequired(messageInput, messageError, 'Please enter a message');
        });
        
        // Form submission
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Validate all fields
            const isEmailValid = this.validateEmail(emailInput, emailError);
            const isNameValid = this.validateRequired(nameInput, nameError, 'Please enter your name');
            const isMessageValid = this.validateRequired(messageInput, messageError, 'Please enter a message');
            
            // If all valid, submit the form
            if (isEmailValid && isNameValid && isMessageValid) {
                // In a real application, you would send the form data to a server
                // For this demo, just show a success message
                Helpers.showNotification('Message sent successfully!', 'success');
                form.reset();
            }
        });
    },
    
    /**
     * Create an error message element
     * @param {string} id - Element ID
     * @returns {HTMLElement} Error element
     */
    createErrorElement(id) {
        const errorElement = document.createElement('span');
        errorElement.id = id;
        errorElement.className = 'error-message';
        return errorElement;
    },
    
    /**
     * Validate email format
     * @param {HTMLInputElement} input - Email input element
     * @param {HTMLElement} errorElement - Error message element
     * @returns {boolean} Is valid
     */
    validateEmail(input, errorElement) {
        const email = input.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            this.showError(input, errorElement, 'Please enter your email address');
            return false;
        } else if (!emailPattern.test(email)) {
            this.showError(input, errorElement, 'Please enter a valid email address');
            return false;
        } else {
            this.clearError(input, errorElement);
            return true;
        }
    },
    
    /**
     * Validate required field
     * @param {HTMLInputElement} input - Input element
     * @param {HTMLElement} errorElement - Error message element
     * @param {string} message - Error message
     * @returns {boolean} Is valid
     */
    validateRequired(input, errorElement, message) {
        if (input.value.trim() === '') {
            this.showError(input, errorElement, message);
            return false;
        } else {
            this.clearError(input, errorElement);
            return true;
        }
    },
    
    /**
     * Show error message
     * @param {HTMLInputElement} input - Input element
     * @param {HTMLElement} errorElement - Error message element
     * @param {string} message - Error message
     */
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },
    
    /**
     * Clear error message
     * @param {HTMLInputElement} input - Input element
     * @param {HTMLElement} errorElement - Error message element
     */
    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
};
