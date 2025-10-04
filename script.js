
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Show/Hide Extra Info ---
    const showMoreBtn = document.getElementById('show-more-btn');
    const extraInfo = document.getElementById('extra-info');

    if (showMoreBtn && extraInfo) {
        showMoreBtn.addEventListener('click', () => {
            const isHidden = extraInfo.classList.contains('hidden');
            extraInfo.classList.toggle('hidden');
            showMoreBtn.textContent = isHidden ? 'Show Less' : 'Show More';
        });
    }

    // --- 2. Form Validation ---
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailInput.value;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                emailError.textContent = 'Please enter a valid email address.';
                emailInput.style.borderColor = 'red';
            } else {
                emailError.textContent = '';
                emailInput.style.borderColor = '#ddd';
                alert('Form submitted successfully! (Not really, this is just a demo)');
                contactForm.reset();
            }
        });
    }

    // --- 3. To-Do List App ---
    const todoList = document.getElementById('todo-list');

    // Only run To-Do logic if the list container exists on the page
    if (todoList) {
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        const API_URL = 'http://localhost:3000/todos';

        // Helper function to add a task to the DOM
        const addTask = (todo) => {
            const li = document.createElement('li');
            li.dataset.id = todo.id;

            const isCompleted = todo.completed === 1 || todo.completed === true;
            if (isCompleted) {
                li.classList.add('completed');
            }

            const completeButtonText = isCompleted ? 'Undo' : 'Complete';

            li.innerHTML = `
                <span>${todo.task}</span>
                <div>
                    <button class="complete-btn">${completeButtonText}</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        };

        // Fetch initial todos from the backend
        const fetchTodos = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const todos = await response.json();
                todoList.innerHTML = '';
                todos.forEach(todo => addTask(todo));
            } catch (error) {
                console.error('Failed to fetch todos:', error);
                todoList.innerHTML = '<li>Error: Could not load tasks from the server.</li>';
            }
        };

        // Add task form submission
        if (todoForm) {
            todoForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const taskText = todoInput.value.trim();

                if (taskText !== '') {
                    try {
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ task: taskText })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const newTodo = await response.json();
                        addTask(newTodo);
                        todoInput.value = '';
                        todoInput.focus();
                    } catch (error) {
                        console.error('Failed to add todo:', error);
                        alert('Failed to add task. Please try again.');
                    }
                }
            });
        }

        // Event delegation for delete and complete buttons
        todoList.addEventListener('click', async (event) => {
            const target = event.target;
            const li = target.closest('li');
            if (!li) return;

            const id = li.dataset.id;

            if (target.classList.contains('delete-btn')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    li.remove();
                } catch (error) {
                    console.error('Failed to delete todo:', error);
                    alert('Failed to delete task. Please try again.');
                }
            } else if (target.classList.contains('complete-btn')) {
                const isCurrentlyCompleted = li.classList.contains('completed');
                try {
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: !isCurrentlyCompleted })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    li.classList.toggle('completed');
                    target.textContent = li.classList.contains('completed') ? 'Undo' : 'Complete';
                } catch (error) {
                    console.error('Failed to update todo:', error);
                    alert('Failed to update task status. Please try again.');
                }
            }
        });

        // Initial fetch of todos
        fetchTodos();
    }

    // --- 4. Calendar Logic ---
    const calendarContainer = document.querySelector('.calendar-container');

    // Only run calendar logic if the calendar container exists on the page
    if (calendarContainer) {
        const monthYearDisplay = document.getElementById('month-year-display');
        const calendarDays = document.getElementById('calendar-days');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');

        let currentDate = new Date();

        function renderCalendar() {
            const today = new Date();
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();

            monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
            calendarDays.innerHTML = '';

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            // Add days from the previous month
            for (let i = firstDayOfMonth; i > 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = daysInPrevMonth - i + 1;
                calendarDays.appendChild(dayElement);
            }

            // Add days for the current month
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = i;

                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                calendarDays.appendChild(dayElement);
            }

            // Add days for the next month to fill the grid
            const totalDaysRendered = firstDayOfMonth + daysInMonth;
            const nextMonthDays = (7 - (totalDaysRendered % 7)) % 7;

            for (let i = 1; i <= nextMonthDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = i;
                calendarDays.appendChild(dayElement);
            }
        }

        // Event Listeners for month navigation
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Event listener for day selection
        calendarDays.addEventListener('click', (event) => {
            const clickedDay = event.target.closest('.calendar-day');

            // Proceed only if a valid day of the current month is clicked
            if (clickedDay && !clickedDay.classList.contains('other-month')) {
                // Remove 'selected' from any previously selected day
                const previouslySelected = calendarDays.querySelector('.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }

                // Add 'selected' to the clicked day
                clickedDay.classList.add('selected');
            }
        });

        // Initial render
        renderCalendar();
    }
});
