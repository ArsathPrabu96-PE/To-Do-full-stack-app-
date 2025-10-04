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
};