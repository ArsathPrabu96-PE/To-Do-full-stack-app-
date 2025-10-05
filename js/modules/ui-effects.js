/**
 * UI effects and animations
 */
const UIEffects = {
    /**
     * Initialize UI effects
     */
    init() {
        this.setupShowMoreButton();
        this.setupScrollAnimations();
        this.setupButtonRipples();
    },
    
    /**
     * Set up the show more/less button functionality
     */
    setupShowMoreButton() {
        const showMoreBtn = document.getElementById('show-more-btn');
        const extraInfo = document.getElementById('extra-info');
        
        if (showMoreBtn && extraInfo) {
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
        }
    },
    
    /**
     * Set up animations triggered by scrolling
     */
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
    }
,

    /**
     * Add a click ripple effect to buttons and elements with .btn-small
     * Uses CSS-only visuals with JS computing the click coordinates so the ripple
     * originates from the pointer position.
     */
    setupButtonRipples() {
        const rippleTargets = document.querySelectorAll('button, .btn-small, .project a');

        function createRipple(e) {
            const target = e.currentTarget;

            // Don't create ripples on disabled buttons
            if (target.disabled) return;

            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            // Determine if button has light background -> use dark ripple for contrast
            const bg = window.getComputedStyle(target).backgroundColor || '';
            if (bg.includes('rgb') && bg !== 'transparent') {
                // crude luminance check
                if (bg.indexOf('255') !== -1 || bg.indexOf('249') !== -1) ripple.classList.add('dark');
            }

            // Position in local coordinates
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            // Size: cover the bigger dimension of the element
            const maxDim = Math.max(rect.width, rect.height);
            const size = Math.ceil(maxDim * 2);
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';

            // Ensure position is absolute relative to the target
            ripple.style.position = 'absolute';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';

            // Make wrapper positioned so absolute works
            if (window.getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }

            target.appendChild(ripple);

            // Force a frame, then expand
            requestAnimationFrame(() => {
                ripple.style.transform = 'translate(-50%, -50%) scale(1)';
                ripple.style.opacity = '1';
            });

            // Cleanup after animation
            setTimeout(() => {
                ripple.style.opacity = '0';
                // remove after fade
                setTimeout(() => { ripple.remove(); }, 300);
            }, 420);
        }

        rippleTargets.forEach(el => {
            el.addEventListener('pointerdown', createRipple);
        });
    }
};