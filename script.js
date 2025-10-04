
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Show/Hide Extra Info ---
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

        // --- New: State for selected date and date formatting helper ---
        let selectedDate = new Date(); // Default to today

        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Helper function to add a task to the DOM
        const addTask = (todo) => {
            const li = document.createElement('li');
            li.dataset.id = todo.id;

            const isCompleted = todo.completed === 1 || todo.completed === true;
            if (isCompleted) {
                li.classList.add('completed');
            }

            const completeButtonIcon = isCompleted ? 'fa-undo' : 'fa-check';
            const completeButtonText = isCompleted ? 'Undo' : 'Complete';

            li.innerHTML = `
                <span>${todo.text}</span>
                <div>
                    <button class="complete-btn"><i class="fas ${completeButtonIcon}"></i> ${completeButtonText}</button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        };

        // --- Update the fetchTodos function

        // Function to fetch todos from the server
        async function fetchTodos(selectedDate) {
            try {
                // Format the date parameter if provided
                let url = 'http://localhost:3000/todos';
                if (selectedDate) {
                    const formattedDate = formatDate(selectedDate);
                    url += `?date=${formattedDate}`;
                }
                
                const response = await fetch(url);
                
                // Check if the response is ok (status in the range 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const todos = await response.json();
                renderTodos(todos);
                return todos;
            } catch (error) {
                console.error('Failed to fetch todos:', error);
                // Display a user-friendly error message
                const todoList = document.getElementById('todo-list');
                if (todoList) {
                    todoList.innerHTML = `<li class="error-message">Could not load tasks. Please try again later.</li>`;
                }
                return [];
            }
        }

        // Function to render todos in the UI
        function renderTodos(todos) {
            const todoList = document.getElementById('todo-list');
            if (!todoList) return;
            
            if (todos.length === 0) {
                todoList.innerHTML = '<li class="empty-state">No tasks for this day. Add one!</li>';
                return;
            }
            
            todoList.innerHTML = '';
            
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.dataset.id = todo.id;
                if (todo.completed) {
                    li.classList.add('completed');
                }
                
                // Create task text span
                const span = document.createElement('span');
                span.textContent = todo.text;
                li.appendChild(span);
                
                // Create button wrapper
                const buttonWrapper = document.createElement('div');
                buttonWrapper.className = 'button-wrapper';
                
                // Complete button
                const completeBtn = document.createElement('button');
                completeBtn.className = 'complete-btn';
                completeBtn.innerHTML = todo.completed ? 
                    '<i class="fas fa-undo"></i>' : 
                    '<i class="fas fa-check"></i>';
                completeBtn.setAttribute('aria-label', todo.completed ? 'Mark as incomplete' : 'Mark as complete');
                completeBtn.addEventListener('click', () => toggleComplete(todo.id, !todo.completed));
                buttonWrapper.appendChild(completeBtn);
                
                // Edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.setAttribute('aria-label', 'Edit task');
                editBtn.addEventListener('click', () => editTodo(li, todo.id, todo.text));
                buttonWrapper.appendChild(editBtn);
                
                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.setAttribute('aria-label', 'Delete task');
                deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
                buttonWrapper.appendChild(deleteBtn);
                
                li.appendChild(buttonWrapper);
                todoList.appendChild(li);
            });
        }

        // Add task form submission
        if (todoForm) {
            todoForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const taskText = todoInput.value.trim();

                if (taskText !== '') {
                    try {
                        const formattedDate = formatDate(selectedDate); // Use the currently selected date
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: taskText, date: formattedDate }) // Send date to backend
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        // Instead of manually creating the item, just refetch for the current day
                        await fetchTodos(selectedDate);
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
                    const completeButton = target.closest('.complete-btn');
                    if (li.classList.contains('completed')) {
                        completeButton.innerHTML = '<i class="fas fa-undo"></i> Undo';
                    } else {
                        completeButton.innerHTML = '<i class="fas fa-check"></i> Complete';
                    }
                } catch (error) {
                    console.error('Failed to update todo:', error);
                    alert('Failed to update task status. Please try again.');
                }
            }
        });

        // NEW: Function to handle editing a todo
        const editTodo = (li, id, currentText) => {
            const span = li.querySelector('span');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'edit-input';
            
            li.replaceChild(input, span);
            input.focus();
            
            const saveChanges = async () => {
                const newText = input.value.trim();
                if (newText && newText !== currentText) {
                    try {
                        const response = await fetch(`${API_URL}/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: newText })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const updatedTodo = await response.json();
                        span.textContent = updatedTodo.text;
                    } catch (error) {
                        console.error('Failed to update todo:', error);
                        alert('Failed to update task. Please try again.');
                    }
                }
                li.replaceChild(span, input);
            };
            
            input.addEventListener('blur', saveChanges);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                } else if (e.key === 'Escape') {
                    li.replaceChild(span, input);
                }
            });
        };

        // NEW: Function to toggle task completion status
        const toggleComplete = async (id, shouldComplete) => {
            try {
                const response = await fetch(`http://localhost:3000/todos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: shouldComplete }),
                });
                if (!response.ok) throw new Error('Failed to update task status');

                const updatedTodo = await response.json();
                const li = document.querySelector(`li[data-id="${id}"]`);
                if (li) {
                    li.classList.toggle('completed', updatedTodo.completed);
                    const completeBtn = li.querySelector('.complete-btn');
                    if (updatedTodo.completed) {
                        completeBtn.innerHTML = '<i class="fas fa-undo"></i> Undo';
                    } else {
                        completeBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
                    }
                }
            } catch (error) {
                console.error('Error toggling task completion:', error);
            }
        };

        // Initial fetch of todos for the default date (today)
        fetchTodos(selectedDate);
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

        // Add these variables to your calendar section
        let calendarViewMode = 'month'; // 'month', 'week', or 'day'

        function initializeViewSwitcher() {
            // Create view switcher buttons
            const viewSwitcher = document.createElement('div');
            viewSwitcher.className = 'view-switcher';
            
            const monthBtn = document.createElement('button');
            monthBtn.textContent = 'Month';
            monthBtn.className = 'view-btn active';
            monthBtn.addEventListener('click', () => switchView('month'));
            
            const weekBtn = document.createElement('button');
            weekBtn.textContent = 'Week';
            weekBtn.className = 'view-btn';
            weekBtn.addEventListener('click', () => switchView('week'));
            
            const dayBtn = document.createElement('button');
            dayBtn.textContent = 'Day';
            dayBtn.className = 'view-btn';
            dayBtn.addEventListener('click', () => switchView('day'));
            
            viewSwitcher.appendChild(monthBtn);
            viewSwitcher.appendChild(weekBtn);
            viewSwitcher.appendChild(dayBtn);
            
            // Insert the view switcher before the calendar controls
            calendarContainer.insertBefore(viewSwitcher, calendarContainer.firstChild);
        }

        function switchView(view) {
            // Remove active class from all buttons
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            event.target.classList.add('active');
            
            calendarViewMode = view;
            
            // Re-render calendar based on new view mode
            renderCalendar();
        }

        function renderCalendar() {
            const today = new Date();
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();

            // Update the month/year display
            monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
            calendarDays.innerHTML = '';

            // Render based on view mode
            if (calendarViewMode === 'month') {
                renderMonthView(today, month, year);
            } else if (calendarViewMode === 'week') {
                renderWeekView(today);
            } else if (calendarViewMode === 'day') {
                renderDayView(today);
            }
            
            // After rendering, update task indicators
            updateTaskIndicators();
        }

        function renderMonthView(today, month, year) {
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
                
                // Store the date as a data attribute for easy access
                const dateStr = formatDate(new Date(year, month, i));
                dayElement.dataset.date = dateStr;
                
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

        function renderWeekView(today) {
            // Get the current week's start date (Sunday)
            const currentDay = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - currentDay);
            
            // Update header to show week range
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            monthYearDisplay.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            
            // Create a row for hours
            const hoursRow = document.createElement('div');
            hoursRow.className = 'week-hours';
            calendarDays.appendChild(hoursRow);
            
            // Render 7 days of the week
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'week-day');
                
                // Add day name and date
                const dayHeader = document.createElement('div');
                dayHeader.className = 'week-day-header';
                dayHeader.innerHTML = `${date.toLocaleString('default', { weekday: 'short' })}<br>${date.getDate()}`;
                dayElement.appendChild(dayHeader);
                
                // Check if this is today
                if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                // Store the date as a data attribute
                dayElement.dataset.date = formatDate(date);
                
                calendarDays.appendChild(dayElement);
            }
        }

        function renderDayView(today) {
            // Update header to show the selected day
            monthYearDisplay.textContent = currentDate.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Create a single day view with hourly slots
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'day-view');
            
            // Check if this is today
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Store the date as a data attribute
            dayElement.dataset.date = formatDate(currentDate);
            
            // Add hourly slots (8 AM to 8 PM)
            for (let hour = 8; hour <= 20; hour++) {
                const hourSlot = document.createElement('div');
                hourSlot.className = 'hour-slot';
                
                const timeLabel = document.createElement('div');
                timeLabel.className = 'time-label';
                timeLabel.textContent = `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
                
                const eventSpace = document.createElement('div');
                eventSpace.className = 'event-space';
                
                hourSlot.appendChild(timeLabel);
                hourSlot.appendChild(eventSpace);
                dayElement.appendChild(hourSlot);
            }
            
            calendarDays.appendChild(dayElement);
        }

        // New function to update task indicators
        async function updateTaskIndicators() {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                
                // Get first and last day of the month
                const firstDay = formatDate(new Date(year, month, 1));
                const lastDay = formatDate(new Date(year, month + 1, 0));
                
                // Fetch all todos for the month
                const response = await fetch(`${API_URL}?startDate=${firstDay}&endDate=${lastDay}`);
                if (!response.ok) throw new Error('Failed to fetch monthly tasks');
                
                const monthlyTodos = await response.json();
                
                // Group todos by date
                const todosByDate = {};
                monthlyTodos.forEach(todo => {
                    const todoDate = todo.date.split('T')[0]; // Extract YYYY-MM-DD part
                    if (!todosByDate[todoDate]) todosByDate[todoDate] = [];
                    todosByDate[todoDate].push(todo);
                });
                
                // Find the maximum number of tasks on any day
                let maxTasks = 0;
                Object.values(todosByDate).forEach(todos => {
                    maxTasks = Math.max(maxTasks, todos.length);
                });
                
                // Update indicators for each day with heat map coloring
                document.querySelectorAll('.calendar-day[data-date]').forEach(dayElement => {
                    const dateStr = dayElement.dataset.date;
                    const indicator = dayElement.querySelector('.task-indicator');
                    
                    if (todosByDate[dateStr] && todosByDate[dateStr].length > 0) {
                        indicator.style.display = 'block';
                        
                        // Calculate intensity based on task count (0.3 to 1.0)
                        const taskCount = todosByDate[dateStr].length;
                        const intensity = 0.3 + (0.7 * (taskCount / maxTasks));
                        
                        // Apply heat map color
                        dayElement.style.backgroundColor = `rgba(var(--primary-rgb), ${intensity * 0.2})`;
                        
                        // Add task count badge
                        const countBadge = document.createElement('span');
                        countBadge.className = 'task-count';
                        countBadge.textContent = taskCount;
                        dayElement.appendChild(countBadge);
                    }
                });
            } catch (error) {
                console.error('Failed to update task indicators:', error);
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

                // --- New: Update selectedDate and fetch todos for the new date ---
                const day = parseInt(clickedDay.textContent, 10);
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                
                if (todoList) { // Check if the todo list exists on the page
                    fetchTodos(selectedDate);
                }
            }
        });

        // --- New: Calendar hover preview functionality ---
        function initializeCalendarHovers() {
            calendarDays.addEventListener('mouseenter', (event) => {
                const dayElement = event.target.closest('.calendar-day');
                if (!dayElement || dayElement.classList.contains('other-month')) return;
                
                const dateStr = dayElement.dataset.date;
                if (!dateStr) return;
                
                // Check if we have tasks for this date
                showTaskPreview(dayElement, dateStr);
            }, true);
            
            // Remove preview when mouse leaves
            calendarDays.addEventListener('mouseleave', (event) => {
                const preview = document.querySelector('.task-preview');
                if (preview) preview.remove();
            }, true);
        }

        async function showTaskPreview(dayElement, dateStr) {
            try {
                const response = await fetch(`${API_URL}?date=${dateStr}`);
                if (!response.ok) throw new Error('Failed to fetch tasks');
                
                const todos = await response.json();
                if (todos.length === 0) return;
                
                // Create preview element
                let preview = document.querySelector('.task-preview');
                if (preview) preview.remove();
                
                preview = document.createElement('div');
                preview.className = 'task-preview';
                
                // Add header
                const header = document.createElement('h4');
                header.textContent = `Tasks for ${new Date(dateStr).toLocaleDateString()}`;
                preview.appendChild(header);
                
                // Add tasks (limit to 3)
                const taskList = document.createElement('ul');
                todos.slice(0, 3).forEach(todo => {
                    const taskItem = document.createElement('li');
                    taskItem.textContent = todo.text;
                    if (todo.completed) taskItem.classList.add('completed');
                    taskList.appendChild(taskItem);
                });
                
                // Add "more" indicator if needed
                if (todos.length > 3) {
                    const moreItem = document.createElement('li');
                    moreItem.className = 'more-tasks';
                    moreItem.textContent = `+ ${todos.length - 3} more tasks`;
                    taskList.appendChild(moreItem);
                }
                
                preview.appendChild(taskList);
                
                // Position the preview
                const rect = dayElement.getBoundingClientRect();
                preview.style.top = `${rect.bottom + window.scrollY + 5}px`;
                preview.style.left = `${rect.left + window.scrollX}px`;
                
                document.body.appendChild(preview);
            } catch (error) {
                console.error('Failed to show task preview:', error);
            }
        }

        // Call this in your initialization
        initializeCalendarHovers();

        // Initialize view switcher
        initializeViewSwitcher();

        // Initial render
        renderCalendar();
    }

    // --- New Animation on Scroll Logic ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

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

    // --- New Todo Item Creation Logic ---
    const createTodoItem = (todo) => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.className = todo.completed ? 'completed' : '';
        li.draggable = true; // Make the item draggable

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleComplete(todo.id, !todo.completed));

        const span = document.createElement('span');
        span.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        // NEW: Create the Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.addEventListener('click', () => handleEdit(li, span, todo));

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        updateCompleteButton(completeBtn, todo.completed);
        completeBtn.addEventListener('change', () => toggleComplete(todo.id, !todo.completed)); // Note: change event is on checkbox
        completeBtn.addEventListener('click', () => toggleComplete(todo.id, !todo.completed));


        li.appendChild(checkbox);
        li.appendChild(span);
        // Add the new buttons to the list item
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-wrapper';
        buttonWrapper.appendChild(editBtn);
        buttonWrapper.appendChild(completeBtn);
        buttonWrapper.appendChild(deleteBtn);

        li.appendChild(buttonWrapper);

        return li;
    };

    // NEW: Function to handle the edit process
    const handleEdit = (li, span, todo) => {
        // Create an input field with the current text
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.className = 'edit-input';
        input.autocomplete = 'off'; // Add this line

        // Replace the span with the input field
        li.replaceChild(input, span);
        input.focus(); // Automatically focus the input

        // When the user clicks away or presses Enter, save the changes
        const saveChanges = async () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                await updateTodoText(todo.id, newText); // This function will call the backend
                span.textContent = newText; // Update the span text
                todo.text = newText; // Update the local todo object
            }
            // Restore the original span
            li.replaceChild(span, input);
        };

        input.addEventListener('blur', saveChanges);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            } else if (e.key === 'Escape') {
                // If Escape is pressed, cancel the edit
                li.replaceChild(span, input);
            }
        });
    };

    // NEW: Function to update the complete button text based on completion state
    const updateCompleteButton = (button, isCompleted) => {
        if (isCompleted) {
            button.innerHTML = '<i class="fas fa-undo"></i> Undo';
        } else {
            button.innerHTML = '<i class="fas fa-check"></i> Complete';
        }
    };

    // NEW: Function to toggle task completion status
    const toggleComplete = async (id, shouldComplete) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: shouldComplete }),
            });
            if (!response.ok) throw new Error('Failed to update task status');

            const updatedTodo = await response.json();
            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) {
                li.classList.toggle('completed', updatedTodo.completed);
                const completeBtn = li.querySelector('.complete-btn');
                updateCompleteButton(completeBtn, updatedTodo.completed);
            }
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const addTodo = async (text) => {
        if (!text) return;

        try {
            const response = await fetch('http://localhost:3000/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }), // Sends { "text": "your new task" }
            });
            if (!response.ok) throw new Error('Failed to add todo');

            const newTodo = await response.json();
            const li = createTodoItem(newTodo);
            todoList.appendChild(li);
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    // NEW: Function to send the updated text to the backend
    const updateTodoText = async (id, text) => {
        try {
            await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
        } catch (error) {
            console.error('Error updating todo text:', error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete task.');
            }
            // Remove the todo item from the list visually
            const itemToRemove = todoList.querySelector(`li[data-id='${id}']`);
            if (itemToRemove) {
                itemToRemove.remove();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        }
    };

    // --- New Drag and Drop Functionality ---
    function initializeDragAndDrop() {
        // Make todo items draggable
        document.querySelectorAll('#todo-list li').forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                item.classList.add('dragging');
            });
        });
        
        document.addEventListener('dragend', (e) => {
            const todoItem = e.target.closest('li');
            if (todoItem) todoItem.classList.remove('dragging');
        });
        
        // Make calendar days drop targets
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('dragover', (e) => {
                // Only allow dropping on days of the current month
                if (!day.classList.contains('other-month')) {
                    e.preventDefault();
                    day.classList.add('drag-over');
                }
            });
            
            day.addEventListener('dragleave', () => {
                day.classList.remove('drag-over');
            });
            
            day.addEventListener('drop', async (e) => {
                e.preventDefault();
                day.classList.remove('drag-over');
                
                // Only process drops on days of the current month
                if (day.classList.contains('other-month')) return;
                
                const todoId = e.dataTransfer.getData('text/plain');
                if (!todoId) return;
                
                const dateStr = day.dataset.date;
                if (!dateStr) return;
                
                // Update the todo's date
                try {
                    await fetch(`${API_URL}/${todoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: dateStr })
                    });
                    
                    // If the drop was successful, update the UI
                    alert(`Task rescheduled to ${new Date(dateStr).toLocaleDateString()}`);
                    
                    // If we're viewing the day the task was moved from, refresh the list
                    if (formatDate(selectedDate) !== dateStr) {
                        fetchTodos(selectedDate);
                    }
                    
                    // Update task indicators
                    updateTaskIndicators();
                } catch (error) {
                    console.error('Failed to reschedule task:', error);
                    alert('Failed to reschedule task. Please try again.');
                }
            });
        });
    }

    // Call this in your initialization
    initializeDragAndDrop();
    
    // Complete calendar implementation
        
    // Calendar functionality
    if (calendarContainer) {
        const monthYearDisplay = document.getElementById('month-year-display');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const calendarDays = document.getElementById('calendar-days');
        
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Date formatting helper function
        function formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Format date for display
        function formatDisplayDate(date) {
            const options = { month: 'long', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
        
        // Get the number of days in a month
        function getDaysInMonth(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }
        
        // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
        function getFirstDayOfMonth(year, month) {
            return new Date(year, month, 1).getDay();
        }
        
        // Render the calendar
        function renderCalendar() {
            // Update month and year display
            const displayDate = new Date(currentYear, currentMonth);
            monthYearDisplay.textContent = formatDisplayDate(displayDate);
            
            // Render the appropriate view
            renderMonthView(displayDate);
            
            // Update selected date if it's in the current month
            const today = new Date();
            if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                const todayCell = document.querySelector(`.calendar-day[data-date="${formatDate(today)}"]`);
                if (todayCell) {
                    todayCell.classList.add('today');
                }
            }
        }
        
        // Render month view
        function renderMonthView(date) {
            calendarDays.innerHTML = '';
            
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const daysInMonth = getDaysInMonth(year, month);
            const firstDayOfMonth = getFirstDayOfMonth(year, month);
            
            // Previous month's days
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
            
            // Add previous month's days
            for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                const dayNumber = daysInPrevMonth - i;
                const dayDate = new Date(prevYear, prevMonth, dayNumber);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = dayNumber;
                dayElement.dataset.date = formattedDate;
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Current month's days
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(year, month, i);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = i;
                dayElement.dataset.date = formattedDate;
                
                // Check if it's today
                const today = new Date();
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Check if it's the selected date
                if (selectedDate && formattedDate === formatDate(selectedDate)) {
                    dayElement.classList.add('selected');
                }
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Next month's days
            const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
            const daysFromNextMonth = 42 - totalDaysDisplayed; // 6 rows of 7 days
            
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            
            for (let i = 1; i <= daysFromNextMonth; i++) {
                const dayDate = new Date(nextYear, nextMonth, i);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = i;
                dayElement.dataset.date = formattedDate;
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Update task indicators
            updateTaskIndicators();
        }
        
        // Select a date
        function selectDate(dateString) {
            // Remove selected class from all days
            document.querySelectorAll('.calendar-day.selected').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Add selected class to the clicked day
            const selectedDay = document.querySelector(`.calendar-day[data-date="${dateString}"]`);
            if (selectedDay) {
                selectedDay.classList.add('selected');
            }
            
            // Update selected date
            selectedDate = new Date(dateString);
            
            // Fetch todos for the selected date
            if (typeof fetchTodos === 'function') {
                fetchTodos(selectedDate);
            }
        }
        
        // Update task indicators on calendar
        async function updateTaskIndicators() {
            try {
                // Get the start and end dates for the current month view
                const startDate = formatDate(new Date(currentYear, currentMonth, 1));
                const endDate = formatDate(new Date(currentYear, currentMonth + 1, 0));
                
                // Fetch task counts for the date range
                const response = await fetch(`http://localhost:3000/todos/count/bydate?startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const taskCounts = await response.json();
                
                // Clear existing indicators
                document.querySelectorAll('.task-indicator, .task-count').forEach(el => el.remove());
                
                // Add indicators for days with tasks
                taskCounts.forEach(item => {
                    const dayElement = document.querySelector(`.calendar-day[data-date="${item.date}"]`);
                    if (dayElement) {
                        // Add indicator dot
                        const indicator = document.createElement('div');
                        indicator.classList.add('task-indicator');
                        dayElement.appendChild(indicator);
                        
                        // If more than one task, add count
                        if (item.count > 1) {
                            const countElement = document.createElement('div');
                            countElement.classList.add('task-count');
                            countElement.textContent = item.count;
                            dayElement.appendChild(countElement);
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to update task indicators:', error);
            }
        }
        
        // Event listeners for month navigation
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
        
        // Initialize calendar
        renderCalendar();
        
        // Initialize with today's date selected
        const today = new Date();
        selectDate(formatDate(today));
    }
    if (calendarContainer) {
        const monthYearDisplay = document.getElementById('month-year-display');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const calendarDays = document.getElementById('calendar-days');
        
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Date formatting helper function
        function formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Format date for display
        function formatDisplayDate(date) {
            const options = { month: 'long', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
        
        // Get the number of days in a month
        function getDaysInMonth(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }
        
        // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
        function getFirstDayOfMonth(year, month) {
            return new Date(year, month, 1).getDay();
        }
        
        // Render the calendar
        function renderCalendar() {
            // Update month and year display
            const displayDate = new Date(currentYear, currentMonth);
            monthYearDisplay.textContent = formatDisplayDate(displayDate);
            
            // Render the appropriate view
            renderMonthView(displayDate);
            
            // Update selected date if it's in the current month
            const today = new Date();
            if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                const todayCell = document.querySelector(`.calendar-day[data-date="${formatDate(today)}"]`);
                if (todayCell) {
                    todayCell.classList.add('today');
                }
            }
        }
        
        // Render month view
        function renderMonthView(date) {
            calendarDays.innerHTML = '';
            
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const daysInMonth = getDaysInMonth(year, month);
            const firstDayOfMonth = getFirstDayOfMonth(year, month);
            
            // Previous month's days
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
            
            // Add previous month's days
            for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                const dayNumber = daysInPrevMonth - i;
                const dayDate = new Date(prevYear, prevMonth, dayNumber);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = dayNumber;
                dayElement.dataset.date = formattedDate;
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Current month's days
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(year, month, i);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = i;
                dayElement.dataset.date = formattedDate;
                
                // Check if it's today
                const today = new Date();
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Check if it's the selected date
                if (selectedDate && formattedDate === formatDate(selectedDate)) {
                    dayElement.classList.add('selected');
                }
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Next month's days
            const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
            const daysFromNextMonth = 42 - totalDaysDisplayed; // 6 rows of 7 days
            
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            
            for (let i = 1; i <= daysFromNextMonth; i++) {
                const dayDate = new Date(nextYear, nextMonth, i);
                const formattedDate = formatDate(dayDate);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = i;
                dayElement.dataset.date = formattedDate;
                
                dayElement.addEventListener('click', () => selectDate(formattedDate));
                
                calendarDays.appendChild(dayElement);
            }
            
            // Update task indicators
            updateTaskIndicators();
        }
        
        // Select a date
        function selectDate(dateString) {
            // Remove selected class from all days
            document.querySelectorAll('.calendar-day.selected').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Add selected class to the clicked day
            const selectedDay = document.querySelector(`.calendar-day[data-date="${dateString}"]`);
            if (selectedDay) {
                selectedDay.classList.add('selected');
            }
            
            // Update selected date
            selectedDate = new Date(dateString);
            
            // Fetch todos for the selected date
            if (typeof fetchTodos === 'function') {
                fetchTodos(selectedDate);
            }
        }
        
        // Update task indicators on calendar
        async function updateTaskIndicators() {
            try {
                // Get the start and end dates for the current month view
                const startDate = formatDate(new Date(currentYear, currentMonth, 1));
                const endDate = formatDate(new Date(currentYear, currentMonth + 1, 0));
                
                // Fetch task counts for the date range
                const response = await fetch(`http://localhost:3000/todos/count/bydate?startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const taskCounts = await response.json();
                
                // Clear existing indicators
                document.querySelectorAll('.task-indicator, .task-count').forEach(el => el.remove());
                
                // Add indicators for days with tasks
                taskCounts.forEach(item => {
                    const dayElement = document.querySelector(`.calendar-day[data-date="${item.date}"]`);
                    if (dayElement) {
                        // Add indicator dot
                        const indicator = document.createElement('div');
                        indicator.classList.add('task-indicator');
                        dayElement.appendChild(indicator);
                        
                        // If more than one task, add count
                        if (item.count > 1) {
                            const countElement = document.createElement('div');
                            countElement.classList.add('task-count');
                            countElement.textContent = item.count;
                            dayElement.appendChild(countElement);
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to update task indicators:', error);
            }
        }
        
        // Event listeners for month navigation
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
        
        // Initialize calendar
        renderCalendar();
        
        // Initialize with today's date selected
        const today = new Date();
        selectDate(formatDate(today));
    }
    
    // Add this to your document ready function

    // Initialize with today's date
    let selectedDate = new Date();
    
    // Fetch initial todos
    fetchTodos(selectedDate);
    
    // Todo form submission
    const todoForm = document.getElementById('todo-form');
    if (todoForm) {
        todoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const todoInput = document.getElementById('todo-input');
            const text = todoInput.value.trim();
            
            if (text) {
                try {
                    const response = await fetch('http://localhost:3000/todos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            date: formatDate(selectedDate)
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const newTodo = await response.json();
                    todoInput.value = '';
                    
                    // Refresh the todo list
                    fetchTodos(selectedDate);
                    
                    // Update calendar indicators
                    if (typeof updateTaskIndicators === 'function') {
                        updateTaskIndicators();
                    }
                } catch (error) {
                    console.error('Error adding todo:', error);
                    alert('Failed to add task. Please try again.');
                }
            }
        });
    }
    
    // Functions to handle todo actions
    
    // Toggle todo completion status
    async function toggleComplete(id, completed) {
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Refresh the todo list
            fetchTodos(selectedDate);
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Failed to update task. Please try again.');
        }
    }
    
    // Edit a todo
    function editTodo(li, id, currentText) {
        // Replace the span with an input field
        const span = li.querySelector('span');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;
        input.setAttribute('aria-label', 'Edit task text');
        
        // Replace span with input
        li.replaceChild(input, span);
        input.focus();
        
        // Handle input blur (save changes)
        input.addEventListener('blur', async () => {
            const newText = input.value.trim();
            
            if (newText && newText !== currentText) {
                try {
                    const response = await fetch(`http://localhost:3000/todos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: newText })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // Refresh the todo list
                    fetchTodos(selectedDate);
                } catch (error) {
                    console.error('Error updating todo:', error);
                    alert('Failed to update task. Please try again.');
                }
            } else {
                // If empty or unchanged, revert back to span
                const newSpan = document.createElement('span');
                newSpan.textContent = currentText;
                li.replaceChild(newSpan, input);
            }
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur(); // Trigger the blur event
            }
        });
    }
    
    // Delete a todo
    async function deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`http://localhost:3000/todos/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Refresh the todo list
                fetchTodos(selectedDate);
                
                // Update calendar indicators
                if (typeof updateTaskIndicators === 'function') {
                    updateTaskIndicators();
                }
            } catch (error) {
                console.error('Error deleting todo:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    }
    
    // Make these functions available globally
    window.toggleComplete = toggleComplete;
    window.editTodo = editTodo;
    window.deleteTodo = deleteTodo;
    window.fetchTodos = fetchTodos;
});
