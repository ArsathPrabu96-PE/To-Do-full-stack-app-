
/**
 * Todo application functionality
 * Handles todo CRUD operations and UI interactions
 */
const TodoApp = {
    todoList: null,
    todoForm: null,
    todoInput: null,
    // Use explicit IPv4 to avoid localhost name resolution/IPv6 issues on some Windows setups
    API_URL: 'http://127.0.0.1:3000/todos',
    taskDates: {}, // Object to store dates with tasks
    
    init() {
        console.log('Initializing TodoApp...');
        this.todoList = document.getElementById('todo-list');
        
        // Only run To-Do logic if the list container exists on the page
        if (!this.todoList) {
            console.log('Todo list container not found, exiting initialization');
            return;
        }
        
        console.log('Todo list container found');
        
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        
        if (!this.todoForm) {
            console.log('Todo form not found');
        }
        if (!this.todoInput) {
            console.log('Todo input not found');
        }
        
        // Set up event listeners
        console.log('Setting up event listeners');
        this.setupEventListeners();
        
    // Initial fetch of todos for today
    console.log('Fetching initial todos for today');
    this.updateConnectionIndicator('checking');
    this.healthCheckAndFetch(new Date());
    // Populate category filter on load (will update after fetch completes)
    this.updateCategoryFilter();
        
        console.log('TodoApp initialization complete');
    },

    // Return Authorization headers if a token exists
    _authHeaders() {
        try {
            const token = localStorage.getItem('token');
            if (token) return { 'Authorization': `Bearer ${token}` };
        } catch (e) { /* ignore */ }
        return {};
    },
    
    setupEventListeners() {
        // Add task form submission
        if (this.todoForm) {
            this.todoForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const taskText = this.todoInput.value.trim();
                
                if (taskText !== '') {
                    this.addTodo(taskText);
                }
            });
        }
        
        // Event delegation for delete, complete, and edit buttons
        this.todoList.addEventListener('click', (event) => {
            const target = event.target;
            const li = target.closest('li');
            if (!li) return;
            
            const id = li.dataset.id;
            
            if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
                this.deleteTodo(id);
            } else if (target.classList.contains('complete-btn') || target.closest('.complete-btn')) {
                const isCurrentlyCompleted = li.classList.contains('completed');
                this.toggleComplete(id, !isCurrentlyCompleted);
            } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
                const taskText = li.querySelector('.task-text');
                this.handleEdit(li, taskText, { id, text: taskText.textContent });
            }
        });
        
        // Filter and sort controls
        const priorityFilter = document.getElementById('priority-filter');
        const categoryFilter = document.getElementById('category-filter');
        const sortByPriority = document.getElementById('sort-by-priority');
        const sortByDate = document.getElementById('sort-by-date');
        const sortByCategory = document.getElementById('sort-by-category');
        
        console.log('Setting up filter and sort controls:', {
            priorityFilter: !!priorityFilter,
            categoryFilter: !!categoryFilter,
            sortByPriority: !!sortByPriority,
            sortByDate: !!sortByDate,
            sortByCategory: !!sortByCategory
        });
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.filterTodos());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterTodos());
        }
        if (sortByPriority) {
            sortByPriority.addEventListener('click', () => {
                console.log('Sort by priority clicked');
                this.sortTodos('priority');
            });
        }
        if (sortByDate) {
            sortByDate.addEventListener('click', () => {
                console.log('Sort by date clicked');
                this.sortTodos('date');
            });
        }
        if (sortByCategory) {
            sortByCategory.addEventListener('click', () => {
                console.log('Sort by category clicked');
                this.sortTodos('category');
            });
        }

        // FAB (floating add button) focuses the todo input
        const fab = document.getElementById('fab-add');
        if (fab && this.todoInput) {
            fab.addEventListener('click', () => {
                this.todoInput.focus();
                // small visual feedback
                fab.classList.add('fab-active');
                setTimeout(() => fab.classList.remove('fab-active'), 250);
            });
        }
    },
    
    /**
     * Fetch todos from the backend for a specific date
     * @param {Date} date - Date to fetch todos for
     */
    async fetchTodos(date) {
        // Ensure we always have a usable date string even if CalendarApp is unavailable
        const formattedDate = (function (d) {
            try {
                if (window.CalendarApp && typeof CalendarApp.formatDate === 'function') {
                    return CalendarApp.formatDate(d);
                }
            } catch (e) { /* ignore and fallback */ }
            // Fallback to ISO date (YYYY-MM-DD)
            try {
                const _d = d instanceof Date ? d : new Date(d);
                return _d.toISOString().slice(0, 10);
            } catch (e) {
                return new Date().toISOString().slice(0, 10);
            }
        })(date);

        try {
            const url = `${this.API_URL}?date=${encodeURIComponent(formattedDate)}`;
            console.log('Fetching todos from:', url);
            
            const headers = this._authHeaders();
            const response = await fetch(url, { headers });
            console.log('Response status:', response.status);

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status} when fetching todos. ${text}`);
            }

            const payload = await response.json();
            // server returns { meta, todos }
            const todos = Array.isArray(payload) ? payload : (payload.todos || []);
            console.log('Received todos:', todos);
            
            this.todoList.innerHTML = '';

            if (todos.length === 0) {
                this.todoList.innerHTML = '<li class="no-tasks">No tasks for this day.</li>';
            } else {
                todos.forEach(todo => {
                    const li = this.createTodoItem(todo);
                    this.todoList.appendChild(li);
                });
            }
            
            // Update task dates for calendar indicators
            this.updateTaskDates();

        } catch (error) {
            console.error('Failed to fetch todos:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);

            // Detect network-level failure (fetch failed to connect)
            const isNetworkError = (error instanceof TypeError && /failed to fetch|network/i.test(error.message));

            // Show a clear actionable message in the UI
            const msg = document.createElement('li');
            msg.className = 'error';
            if (isNetworkError) {
                msg.innerHTML = `Could not connect to the backend at <code>${this.API_URL}</code>. Make sure the server is running (see <code>backend/</code>) and that it's listening on port 3000.`;
            } else {
                msg.textContent = 'Error: Could not load tasks from the server.';
            }
            this.todoList.innerHTML = '';
            this.todoList.appendChild(msg);

            // Populate demo todos so the UI remains usable offline for testing
            const demoTodos = [
                { id: 'demo-1', text: 'Demo: Welcome — start the backend to use real todos', completed: 0, date: formattedDate, category: 'Demo' },
                { id: 'demo-2', text: 'Demo: Try adding tasks when backend is up', completed: 0, date: formattedDate, category: 'Demo' }
            ];
            demoTodos.forEach(todo => {
                const li = this.createTodoItem(todo);
                // mark visually as demo
                li.dataset.id = todo.id;
                this.todoList.appendChild(li);
            });
            // Update connection indicator to disconnected
            this.updateConnectionIndicator('disconnected');
        }
    },

    /**
     * Update the top connection indicator UI
     * @param {'connected'|'disconnected'|'checking'} state
     */
    updateConnectionIndicator(state) {
        const indicator = document.getElementById('connection-indicator');
        if (!indicator) return;
        indicator.classList.remove('connected', 'disconnected', 'checking');
        if (state === 'connected') {
            indicator.classList.add('connected');
            indicator.textContent = 'Connected';
        } else if (state === 'disconnected') {
            indicator.classList.add('disconnected');
            indicator.textContent = 'Disconnected';
        } else {
            indicator.classList.add('checking');
            indicator.textContent = 'Checking...';
        }
    },

    /**
     * Simple health check with retry/backoff before showing offline demo UI
     */
    async healthCheckAndFetch(date) {
        const maxAttempts = 3;
        let attempt = 0;
        let ok = false;

        while (attempt < maxAttempts && !ok) {
            try {
                this.updateConnectionIndicator('checking');
                // Try /health first
                const healthUrl = this.API_URL.replace(/\/todos\/?$/, '/health');
                const headers = this._authHeaders();
                let resp;
                try {
                    resp = await fetch(healthUrl, { method: 'GET', headers });
                } catch (e) {
                    resp = null;
                }

                if (resp && resp.ok) {
                    ok = true;
                    break;
                }

                // Fallback: attempt a lightweight GET to the todos endpoint (may return CORS if blocked, but server reachable often OK)
                try {
                    const r2 = await fetch(this.API_URL + '?_probe=1', { method: 'GET', headers });
                    if (r2 && r2.ok) {
                        ok = true;
                        break;
                    }
                } catch (e) {
                    // ignore and retry
                }
            } catch (e) {
                // ignore outer errors and retry
            }

            // exponential backoff
            const waitMs = Math.pow(2, attempt) * 250; // 250, 500, 1000
            await new Promise(r => setTimeout(r, waitMs));
            attempt++;
        }

        if (ok) {
            this.updateConnectionIndicator('connected');
            // attempt to sync offline todos now that we're connected
            await this.syncOfflineTodos();
            await this.fetchTodos(date);
        } else {
            this.updateConnectionIndicator('disconnected');
            // show demo todos but still call fetch to populate if it succeeds later
            await this.fetchTodos(date);
        }

        // Wire retry button
        const retryBtn = document.getElementById('retry-connection');
        if (retryBtn) {
            retryBtn.addEventListener('click', async () => {
                this.updateConnectionIndicator('checking');
                await this.healthCheckAndFetch(date);
            });
        }
    },

    /**
     * Save a todo locally when offline. Returns the created todo object.
     */
    saveTodoOffline(text, formattedDate) {
        const key = 'offline_todos';
        const store = JSON.parse(localStorage.getItem(key) || '[]');
        const id = `offline-${Date.now()}`;
        const todo = { id, text, completed: 0, date: formattedDate, category: 'Personal', priority: 'medium' };
        store.push(todo);
        localStorage.setItem(key, JSON.stringify(store));
        return todo;
    },

    /**
     * Try to sync offline saved todos (called on successful health check)
     */
    async syncOfflineTodos() {
        try {
            const key = 'offline_todos';
            const store = JSON.parse(localStorage.getItem(key) || '[]');
            if (!store.length) return;
            const synced = [];
            for (const t of store) {
                try {
                    const headers = Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders());
                    const resp = await fetch(this.API_URL, { method: 'POST', headers, body: JSON.stringify({ text: t.text, date: t.date, priority: t.priority, category: t.category }) });
                    if (resp.ok) {
                        synced.push(t.id);
                    }
                } catch (e) { /* keep it for next sync */ }
            }

            // Remove only synced items from store
            const remaining = store.filter(item => !synced.includes(item.id));
            if (remaining.length) {
                localStorage.setItem(key, JSON.stringify(remaining));
            } else {
                localStorage.removeItem(key);
            }

            // Notify user about result
            const syncedCount = synced.length;
            if (syncedCount > 0) {
                Helpers.showNotification(`Synced ${syncedCount} offline ${syncedCount === 1 ? 'task' : 'tasks'}.`, 'success');
            }
        } catch (e) { /* noop */ }
    },
    
    /**
     * Add a new todo
     * @param {string} text - Todo text
     */
    async addTodo(text) {
        if (!text) return;
        
        try {
            const selectedDate = CalendarApp.getSelectedDate();
            const formattedDate = CalendarApp.formatDate(selectedDate);
            
            // Get form values
            const prioritySelect = document.getElementById('priority-select');
            const dueDateInput = document.getElementById('due-date');
            const categoryInput = document.getElementById('category-input');
            
            const priority = prioritySelect ? (prioritySelect.value || 'medium') : 'medium';
            const dueDate = dueDateInput ? dueDateInput.value : '';
            const category = categoryInput ? categoryInput.value : 'Personal';
            
            console.log('Sending request to:', this.API_URL);
            console.log('Request body:', JSON.stringify({ 
                text: text, 
                date: formattedDate,
                priority: priority,
                dueDate: dueDate,
                category: category
            }));
            
            const headers = this._authHeaders();
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
                body: JSON.stringify({ 
                    text: text, 
                    date: formattedDate,
                    priority: priority,
                    dueDate: dueDate,
                    category: category
                })
            });
            
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status} when creating todo. ${text}`);
            }

            const newTodo = await response.json();
            console.log('Received response:', newTodo);
            
            // Remove "no tasks" message if it exists
            const noTasksMessage = this.todoList.querySelector('.no-tasks');
            if (noTasksMessage) {
                noTasksMessage.remove();
            }
            
            const li = this.createTodoItem(newTodo);
            this.todoList.appendChild(li);
            // animate entry
            requestAnimationFrame(() => li.classList.add('slide-in'));
            li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Clear form and reset to defaults
            this.todoInput.value = '';
            this.todoInput.focus();
            
            // Reset priority to medium (default)
            if (prioritySelect) {
                prioritySelect.value = 'medium';
            }
            
            // Clear due date
            if (dueDateInput) {
                dueDateInput.value = '';
            }
            
            // Clear category
            if (categoryInput) {
                categoryInput.value = '';
            }
            
            // Update task dates for calendar indicators
            this.updateTaskDates();
            
            // Show success notification
            Helpers.showNotification('Task added successfully!', 'success');
        } catch (error) {
            console.error('Failed to add todo:', error);
            // If this was a network-level failure, persist locally and show demo/offline item
            const isNetworkError = (error instanceof TypeError && /failed to fetch|network/i.test(error.message));
            if (isNetworkError) {
                try {
                    const offline = this.saveTodoOffline(text, formattedDate);
                    const li = this.createTodoItem(offline);
                    li.classList.add('offline-persisted');
                    this.todoList.appendChild(li);
                    Helpers.showNotification('You are offline — task saved locally and will sync when connection is restored.', 'warning');
                    this.updateTaskDates();
                    return;
                } catch (e) {
                    console.error('Failed to save todo offline:', e);
                }
            }

            Helpers.showNotification('Failed to add task. Please try again.', 'error');
        }
    },
    
    /**
     * Delete a todo
     * @param {string} id - Todo ID
     */
    async deleteTodo(id) {
        try {
            // If this is a demo-local item, just remove it client-side
            if (String(id).startsWith('demo-')) {
                const itemToRemove = this.todoList.querySelector(`li[data-id='${id}']`);
                if (itemToRemove) {
                    itemToRemove.classList.add('slide-out');
                    itemToRemove.addEventListener('animationend', () => {
                        if (itemToRemove && itemToRemove.parentElement) itemToRemove.parentElement.removeChild(itemToRemove);
                    }, { once: true });
                }
                this.updateTaskDates();
                Helpers.showNotification('Demo task removed locally.', 'success');
                return;
            }

            const headers = this._authHeaders();
            const response = await fetch(`${this.API_URL}/${id}`, { 
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove the todo item from the list visually
            const itemToRemove = this.todoList.querySelector(`li[data-id='${id}']`);
            if (itemToRemove) {
                // animate out then remove
                itemToRemove.classList.add('slide-out');
                itemToRemove.addEventListener('animationend', () => {
                    if (itemToRemove && itemToRemove.parentElement) itemToRemove.parentElement.removeChild(itemToRemove);
                }, { once: true });
            }
            
            // If no more todos, show "no tasks" message
            if (this.todoList.children.length === 0) {
                this.todoList.innerHTML = '<li class="no-tasks">No tasks for this day.</li>';
            }
            
            // Update task dates for calendar indicators
            this.updateTaskDates();
            
            // Show success notification
            Helpers.showNotification('Task deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete todo:', error);
            Helpers.showNotification('Failed to delete task. Please try again.', 'error');
        }
    },
    
    /**
     * Toggle todo completion status
     * @param {string} id - Todo ID
     * @param {boolean} completed - New completion status
     */
    async toggleComplete(id, completed) {
        try {
            const headers = Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders());
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ completed })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const li = this.todoList.querySelector(`li[data-id='${id}']`);
            if (li) {
                li.classList.toggle('completed', completed);
                const completeButton = li.querySelector('.complete-btn');
                
                if (completeButton) {
                    if (completed) {
                        completeButton.innerHTML = '<i class="fas fa-undo"></i> Undo';
                    } else {
                        completeButton.innerHTML = '<i class="fas fa-check"></i> Complete';
                    }
                }
                
                // Update checkbox if it exists
                const checkbox = li.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = completed;
                }
            }
        } catch (error) {
            console.error('Failed to update todo:', error);
            Helpers.showNotification('Failed to update task status. Please try again.', 'error');
        }
    },
    
    /**
     * Handle editing a todo
     * @param {HTMLElement} li - Todo list item element
     * @param {HTMLElement} taskTextElement - Todo text element
     * @param {Object} todo - Todo object
     */
    handleEdit(li, taskTextElement, todo) {
        // Create an input field with the current text
        const input = document.createElement('input');
        input.type = 'text';
        input.value = taskTextElement.textContent;
        input.className = 'edit-input';
        input.autocomplete = 'off';
        
        // Get the parent container (task-content)
        const taskContent = taskTextElement.parentElement;
        
        // Replace the task text element with the input field
        taskContent.replaceChild(input, taskTextElement);
        input.focus();
        
        // When the user clicks away or presses Enter, save the changes
        const saveChanges = async () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                await this.updateTodoText(todo.id, newText);
                taskTextElement.textContent = newText;
            }
            // Restore the original task text element
            taskContent.replaceChild(taskTextElement, input);
        };
        
        input.addEventListener('blur', saveChanges);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            } else if (e.key === 'Escape') {
                // If Escape is pressed, cancel the edit
                taskContent.replaceChild(taskTextElement, input);
            }
        });
    },
    
    /**
     * Update todo text
     * @param {string} id - Todo ID
     * @param {string} text - New todo text
     */
    async updateTodoText(id, text) {
        try {
            const headers = Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders());
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ text }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Show success notification
            Helpers.showNotification('Task updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating todo text:', error);
            Helpers.showNotification('Failed to update task. Please try again.', 'error');
        }
    },
    
    /**
     * Create a todo item element
     * @param {Object} todo - Todo object
     * @returns {HTMLElement} Todo list item
     */
    createTodoItem(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.dataset.date = todo.date;
        li.dataset.priority = todo.priority || 'medium';
        li.dataset.category = todo.category || 'Personal';
        li.dataset.dueDate = todo.dueDate || '';

        if (todo.completed) {
            li.classList.add('completed');
        }

        // Priority indicator
        const priorityIndicator = document.createElement('div');
        priorityIndicator.className = `priority-indicator priority-${todo.priority || 'medium'}`;

        // Task content container
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        // Task text
        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.textContent = todo.text;

        // Task metadata
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';

        // Priority text
        const priorityText = document.createElement('span');
        priorityText.className = 'task-priority';
        const priorityLabels = { 'high': '🔴 High', 'medium': '🟡 Medium', 'low': '🟢 Low' };
        priorityText.textContent = priorityLabels[todo.priority] || '🟡 Medium';
        taskMeta.appendChild(priorityText);

        // Category badge
        if (todo.category) {
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'task-category';
            categoryBadge.textContent = todo.category;
            taskMeta.appendChild(categoryBadge);
        }

        // Due date
        if (todo.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'task-due-date';
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today && !todo.completed) {
                dueDateSpan.classList.add('overdue');
            }
            
            dueDateSpan.textContent = `📅 Due: ${dueDate.toLocaleDateString()}`;
            taskMeta.appendChild(dueDateSpan);
        } else {
            // Show creation date if no due date
            const createdDate = new Date(todo.date);
            const createdDateSpan = document.createElement('span');
            createdDateSpan.className = 'task-created-date';
            createdDateSpan.textContent = `📝 Created: ${createdDate.toLocaleDateString()}`;
            taskMeta.appendChild(createdDateSpan);
        }

        taskContent.appendChild(taskText);
        taskContent.appendChild(taskMeta);

    // Buttons wrapper
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'todo-action-buttons button-wrapper';

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn btn-small';
        completeBtn.innerHTML = todo.completed ? '<i class="fas fa-undo"></i> Undo' : '<i class="fas fa-check"></i> Complete';
        completeBtn.setAttribute('aria-label', todo.completed ? 'Mark as incomplete' : 'Mark as complete');

        // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn btn-small';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.setAttribute('aria-label', 'Edit task');

        // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn btn-small';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.setAttribute('aria-label', 'Delete task');

        buttonWrapper.appendChild(completeBtn);
        buttonWrapper.appendChild(editBtn);
        buttonWrapper.appendChild(deleteBtn);

        // Assemble the todo item
        li.appendChild(priorityIndicator);
        li.appendChild(taskContent);
        li.appendChild(buttonWrapper);

        return li;
    },
    
    /**
     * Update the task dates object for calendar indicators
     */
    updateTaskDates() {
        // Get all todo items
        const todoItems = this.todoList.querySelectorAll('li[data-id]');
        const datesWithTasks = {};
        
        todoItems.forEach(item => {
            const date = item.dataset.date;
            if (date) {
                datesWithTasks[date] = true;
            }
        });
        
        this.taskDates = datesWithTasks;
        
        // If CalendarApp is available, update its indicators
        if (window.CalendarApp && typeof window.CalendarApp.updateDayIndicators === 'function') {
            window.CalendarApp.updateDayIndicators();
        }
        // Also refresh category filter options based on current todos
        this.updateCategoryFilter();
    },

    /**
     * Update the category filter select with categories present in the todo list
     */
    updateCategoryFilter() {
        try {
            const categorySelect = document.getElementById('category-filter');
            if (!categorySelect) return;

            // Preserve the currently selected category
            const previous = categorySelect.value || '';

            // Collect unique categories from current todo items
            const items = Array.from(this.todoList.querySelectorAll('li[data-id]'));
            const categories = new Set();
            items.forEach(it => {
                const cat = (it.dataset.category || '').toString().trim();
                if (cat) categories.add(cat);
            });

            // Clear existing options and add default
            categorySelect.innerHTML = '';
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All Categories';
            categorySelect.appendChild(allOption);

            // Sort categories for stable UI
            const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b));
            sorted.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });

            // Restore previous selection if still available
            if (previous) {
                categorySelect.value = previous;
            }
        } catch (err) {
            console.error('Error updating category filter:', err);
        }
    },
    
    /**
     * Get dates that have tasks
     * @returns {Object} - An object with dates as keys
     */
    getDatesWithTasks() {
        return this.taskDates;
    },
    
    /**
     * Filter todos based on priority and category
     */
    filterTodos() {
        const priorityFilter = document.getElementById('priority-filter');
        const categoryFilter = document.getElementById('category-filter');
        const todos = Array.from(this.todoList.children);
        
        const selectedPriority = priorityFilter ? priorityFilter.value : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        todos.forEach(todo => {
            const priority = todo.dataset.priority || '';
            const category = todo.dataset.category || '';
            
            let showTodo = true;
            
            if (selectedPriority && priority !== selectedPriority) {
                showTodo = false;
            }
            
            if (selectedCategory && category !== selectedCategory) {
                showTodo = false;
            }
            
            todo.style.display = showTodo ? 'flex' : 'none';
        });
        
        console.log('Filtering todos:', {
            selectedPriority,
            selectedCategory,
            totalTodos: todos.length,
            visibleTodos: todos.filter(todo => todo.style.display !== 'none').length
        });
    },
    
    /**
     * Sort todos by priority, date, or category
     * @param {string} sortBy - 'priority', 'date', or 'category'
     */
    sortTodos(sortBy) {
        const todos = Array.from(this.todoList.children);
        
        console.log('Sorting todos by:', sortBy);
        console.log('Total todos found:', todos.length);
        
        if (todos.length === 0) {
            console.log('No todos to sort');
            return;
        }
        
        console.log('Todos before sorting:', todos.map(todo => ({
            id: todo.dataset.id,
            priority: todo.dataset.priority,
            category: todo.dataset.category,
            dueDate: todo.dataset.dueDate
        })));
        
        todos.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                const aPriority = priorityOrder[a.dataset.priority] || 0;
                const bPriority = priorityOrder[b.dataset.priority] || 0;
                return bPriority - aPriority;
            } else if (sortBy === 'date') {
                const aDate = a.dataset.dueDate ? new Date(a.dataset.dueDate) : new Date('9999-12-31');
                const bDate = b.dataset.dueDate ? new Date(b.dataset.dueDate) : new Date('9999-12-31');
                return aDate - bDate;
            } else if (sortBy === 'category') {
                const aCategory = a.dataset.category || '';
                const bCategory = b.dataset.category || '';
                return aCategory.localeCompare(bCategory);
            }
            return 0;
        });
        
        console.log('Todos after sorting:', todos.map(todo => ({
            id: todo.dataset.id,
            priority: todo.dataset.priority,
            category: todo.dataset.category,
            dueDate: todo.dataset.dueDate
        })));
        
        // Clear the list and re-append sorted todos
        this.todoList.innerHTML = '';
        todos.forEach(todo => {
            this.todoList.appendChild(todo);
            // Make sure the todo is visible after sorting
            todo.style.display = 'flex';
        });
    },
    
    /**
     * Add sample todos to demonstrate the functionality
     */
    async addSampleTodos() {
        // Check if there are already todos
        const existingTodos = this.todoList.children.length;
        if (existingTodos > 0) {
            console.log('Sample todos already exist, skipping...');
            return;
        }
        
        console.log('Adding sample todos...');
        
        const sampleTodos = [
            {
                text: "Book flight tickets to Japan",
                priority: "high",
                category: "Trip Planning",
                dueDate: "2024-12-15"
            },
            {
                text: "Apply for tourist visa",
                priority: "high", 
                category: "Trip Planning",
                dueDate: "2024-11-30"
            },
            {
                text: "Research hotels in Tokyo",
                priority: "medium",
                category: "Trip Planning", 
                dueDate: "2024-12-01"
            },
            {
                text: "Create travel itinerary",
                priority: "medium",
                category: "Trip Planning",
                dueDate: "2024-12-10"
            },
            {
                text: "Buy travel insurance",
                priority: "medium",
                category: "Trip Planning",
                dueDate: "2024-12-05"
            },
            {
                text: "Complete project report",
                priority: "high",
                category: "Work",
                dueDate: "2024-11-25"
            },
            {
                text: "Team meeting preparation",
                priority: "medium",
                category: "Work",
                dueDate: "2024-11-28"
            },
            {
                text: "Grocery shopping",
                priority: "low",
                category: "Personal",
                dueDate: "2024-11-24"
            },
            {
                text: "Call dentist for appointment",
                priority: "low",
                category: "Personal",
                dueDate: "2024-12-20"
            },
            {
                text: "Learn basic Japanese phrases",
                priority: "low",
                category: "Trip Planning",
                dueDate: "2024-12-01"
            }
        ];
        
        // Add sample todos to the backend
        for (const todo of sampleTodos) {
            try {
                const selectedDate = CalendarApp.getSelectedDate();
                const formattedDate = CalendarApp.formatDate(selectedDate);
                
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                        headers: Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders()),
                    body: JSON.stringify({
                        text: todo.text,
                        date: formattedDate,
                        priority: todo.priority,
                        dueDate: todo.dueDate,
                        category: todo.category
                    })
                });
                
                if (response.ok) {
                    const newTodo = await response.json();
                    console.log('Added sample todo:', newTodo);
                }
            } catch (error) {
                console.error('Error adding sample todo:', error);
            }
        }
        
        // Refresh the todo list to show the new items
        this.fetchTodos(CalendarApp.getSelectedDate());
    }
};
