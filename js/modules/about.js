
/**
 * About section functionality
 * Handles the show more/show less toggle
 */
const AboutSection = {
    init() {
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
    }
};
