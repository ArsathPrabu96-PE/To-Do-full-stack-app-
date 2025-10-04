
/**
 * Animation effects module
 * Handles animations and transitions across the application
 */
const AnimationEffects = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    },
    
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animatedElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing the element once it's visible
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    },
    
    setupHoverEffects() {
        // Add hover effects to buttons and interactive elements
        const buttons = document.querySelectorAll('button, .btn-secondary, .project a');
        
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => {
                this.addButtonHoverEffect(button);
            });
            
            button.addEventListener('mouseout', () => {
                this.removeButtonHoverEffect(button);
            });
        });
    },
    
    addButtonHoverEffect(button) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    },
    
    removeButtonHoverEffect(button) {
        button.style.transform = '';
        button.style.boxShadow = '';
    },
    
    /**
     * Animate an element with a specific animation class
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationClass - CSS animation class to apply
     * @param {boolean} removeAfter - Whether to remove the class after animation
     */
    animateElement(element, animationClass, removeAfter = false) {
        if (!element) return;
        
        element.classList.add(animationClass);
        
        if (removeAfter) {
            // Get the animation duration from CSS
            const style = window.getComputedStyle(element);
            const duration = parseFloat(style.animationDuration) * 1000;
            
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, duration);
        }
    },
    
    /**
     * Create a ripple effect on click
     * @param {Event} event - Click event
     */
    createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.querySelector('.ripple');
        
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
};
