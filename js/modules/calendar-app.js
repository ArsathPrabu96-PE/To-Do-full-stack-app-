/**
 * Calendar application functionality
 * Handles date selection and calendar rendering
 */
const CalendarApp = {
    currentDate: new Date(),
    selectedDate: new Date(),
    calendarContainer: null,
    monthYearDisplay: null,
    calendarDays: null,
    prevMonthBtn: null,
    nextMonthBtn: null,
    
    init() {
        this.calendarContainer = document.querySelector('.calendar-container');
        
        // Only run calendar logic if the calendar container exists on the page
        if (!this.calendarContainer) return;
        
        this.monthYearDisplay = document.getElementById('month-year-display');
        this.calendarDays = document.getElementById('calendar-days');
        this.prevMonthBtn = document.getElementById('prev-month-btn');
        this.nextMonthBtn = document.getElementById('next-month-btn');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderCalendar();
    },
    
    setupEventListeners() {
        // Event Listeners for month navigation
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        this.nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Event listener for day selection
        this.calendarDays.addEventListener('click', (event) => {
            const clickedDay = event.target.closest('.calendar-day');
            
            // Proceed only if a valid day of the current month is clicked
            if (clickedDay && !clickedDay.classList.contains('other-month')) {
                // Remove 'selected' from any previously selected day
                const previouslySelected = this.calendarDays.querySelector('.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                
                // Add 'selected' to the clicked day
                clickedDay.classList.add('selected');
                
                // Update selectedDate and fetch todos for the new date
                const day = parseInt(clickedDay.textContent, 10);
                this.selectedDate = new Date(
                    this.currentDate.getFullYear(), 
                    this.currentDate.getMonth(), 
                    day
                );
                
                // If TodoApp exists, fetch todos for the selected date
                if (typeof TodoApp !== 'undefined') {
                    TodoApp.fetchTodos(this.selectedDate);
                }
            }
        });
    },
    
    renderCalendar() {
        const today = new Date();
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        
        this.monthYearDisplay.textContent = `${this.currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        this.calendarDays.innerHTML = '';
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Add days from the previous month
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayElement = Helpers.createElement('div', {
                className: 'calendar-day other-month'
            }, daysInPrevMonth - i + 1);
            this.calendarDays.appendChild(dayElement);
        }
        
        // Add days for the current month
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
                           
            const isSelected = i === this.selectedDate.getDate() && 
                              month === this.selectedDate.getMonth() && 
                              year === this.selectedDate.getFullYear();
            
            const className = `calendar-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`;
            
            // Attach a data-date attribute for easy lookups (YYYY-MM-DD)
            const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const dayElement = Helpers.createElement('div', {
                className: className,
                'data-date': dateString
            }, i);
            
            this.calendarDays.appendChild(dayElement);
        }
        
        // Add days for the next month to fill the grid
        const totalDaysRendered = firstDayOfMonth + daysInMonth;
        const nextMonthDays = (7 - (totalDaysRendered % 7)) % 7;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const dayElement = Helpers.createElement('div', {
                className: 'calendar-day other-month'
            }, i);
            this.calendarDays.appendChild(dayElement);
        }
    },
    
    /**
     * Add task indicators to calendar days
     * @param {Object} taskDates - Object with dates as keys and task counts as values
     */
    updateTaskIndicators(taskDates) {
        if (!taskDates || !this.calendarDays) return;
        
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Clear existing indicators
        const existingIndicators = this.calendarDays.querySelectorAll('.task-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        // Add new indicators
        // For each date in the map, find the matching day element by data-date
        Object.keys(taskDates).forEach(dateString => {
            const count = taskDates[dateString];
            const dayElement = this.calendarDays.querySelector(`.calendar-day[data-date='${dateString}']`);
            if (!dayElement) return;

            // Add or update badge
            let badge = dayElement.querySelector('.task-count-badge');
            if (!badge) {
                badge = Helpers.createElement('span', { className: 'task-count-badge' }, String(count));
                dayElement.appendChild(badge);
            } else {
                badge.textContent = String(count);
            }

            // Apply color class based on a simple heuristic: 1 -> low, 2 -> medium, >=3 -> high
            dayElement.classList.remove('task-low', 'task-medium', 'task-high');
            if (count >= 3) dayElement.classList.add('task-high');
            else if (count === 2) dayElement.classList.add('task-medium');
            else dayElement.classList.add('task-low');
        });

        // Add legend if not present
        if (!this.calendarContainer.querySelector('.calendar-legend')) {
            const legend = Helpers.createElement('div', { className: 'calendar-legend' });
            const low = Helpers.createElement('div', { className: 'legend-item legend-low' }, 'Low');
            low.prepend(Helpers.createElement('span', { className: 'legend-color' }));
            const med = Helpers.createElement('div', { className: 'legend-item legend-medium' }, 'Medium');
            med.prepend(Helpers.createElement('span', { className: 'legend-color' }));
            const high = Helpers.createElement('div', { className: 'legend-item legend-high' }, 'High');
            high.prepend(Helpers.createElement('span', { className: 'legend-color' }));
            legend.appendChild(low);
            legend.appendChild(med);
            legend.appendChild(high);
            this.calendarContainer.appendChild(legend);
        }
    },

    // Backwards-compatible alias used by TodoApp
    updateDayIndicators() {
        try {
            const dates = (window.TodoApp && typeof window.TodoApp.getDatesWithTasks === 'function') ? window.TodoApp.getDatesWithTasks() : {};
            this.updateTaskIndicators(dates);
        } catch (e) {
            // ignore
        }
    },
    
    /**
     * Get formatted date string
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string (YYYY-MM-DD)
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Get the current selected date
     * @returns {Date} The currently selected date
     */
    getSelectedDate() {
        return this.selectedDate;
    }
};
