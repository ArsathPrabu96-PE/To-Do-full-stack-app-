/**
 * About section functionality
 * Handles show/hide extra info
 */
const AboutSection = {
    showMoreBtn: null,
    extraInfo: null,
    
    init() {
        this.showMoreBtn = document.getElementById('show-more-btn');
        this.extraInfo = document.getElementById('extra-info');
        
        if (!this.showMoreBtn || !this.extraInfo) return;
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        this.showMoreBtn.addEventListener('click', () => {
            const isHidden = this.extraInfo.classList.contains('hidden');
            this.extraInfo.classList.toggle('hidden');
            
            // Update button text and icon
            if (isHidden) {
                this.showMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
            } else {
                this.showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
            }
        });
    }
};

// Initialize the about section when the page loads
document.addEventListener('DOMContentLoaded', () => {
    AboutSection.init();
});
