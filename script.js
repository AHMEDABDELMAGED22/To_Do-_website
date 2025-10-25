class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentPage = this.getCurrentPage();
        this.filters = {
            status: 'all',
            priority: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.renderTasks();
        this.updateProgress();
        this.setupEventListeners();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('all-tasks')) return 'all-tasks';
        if (path.includes('important')) return 'important';
        if (path.includes('planned')) return 'planned';
        return 'my-day';
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('mydayTasks');
        if (savedTasks) {
            return JSON.parse(savedTasks);
        }
        
        // Default sample tasks
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 5);

        return [
            // Overdue tasks
            {
                id: 1,
                title: 'Design new landing page',
                description: 'Create new landing page design for website',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'high',
                tags: ['Work', 'Design'],
                status: 'todo',
                isImportant: true,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Fix critical bug in production',
                description: 'Fix the critical bug affecting user login',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'high',
                tags: ['Work', 'Bug'],
                status: 'todo',
                isImportant: true,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Buy groceries',
                description: 'Buy groceries for the week',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'medium',
                tags: ['Personal', 'Shopping'],
                status: 'todo',
                isImportant: true,
                category: 'Personal',
                createdAt: new Date().toISOString()
            },
            // Today's tasks
            {
                id: 4,
                title: 'Client meeting preparation',
                description: 'Prepare presentation and materials for client meeting',
                dueDate: today.toISOString().split('T')[0],
                priority: 'high',
                tags: ['Work', 'Meeting'],
                status: 'todo',
                isImportant: true,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'Front End Campus',
                description: 'Complete frontend development course modules',
                dueDate: today.toISOString().split('T')[0],
                priority: 'medium',
                tags: ['Work', 'Learning'],
                status: 'todo',
                isImportant: false,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            // Tomorrow's tasks
            {
                id: 6,
                title: 'Review pull requests',
                description: 'Review and approve pending pull requests',
                dueDate: tomorrow.toISOString().split('T')[0],
                priority: 'medium',
                tags: ['Work', 'Code Review'],
                status: 'todo',
                isImportant: false,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            // This week's tasks
            {
                id: 7,
                title: 'Update documentation',
                description: 'Update project documentation',
                dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: 'low',
                tags: ['Work', 'Documentation'],
                status: 'todo',
                isImportant: false,
                category: 'Work',
                createdAt: new Date().toISOString()
            },
            {
                id: 8,
                title: 'Schedule dentist appointment',
                description: 'Call dentist to schedule appointment',
                dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: 'medium',
                tags: ['Personal', 'Health'],
                status: 'todo',
                isImportant: false,
                category: 'Personal',
                createdAt: new Date().toISOString()
            },
            {
                id: 9,
                title: 'Plan weekend trip',
                description: 'Plan and book weekend trip',
                dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: 'low',
                tags: ['Personal', 'Travel'],
                status: 'todo',
                isImportant: true,
                category: 'Personal',
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveTasks() {
        localStorage.setItem('mydayTasks', JSON.stringify(this.tasks));
    }

    addTask(taskData) {
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate || '',
            priority: taskData.priority || 'medium',
            tags: taskData.tags || [],
            status: taskData.status || 'todo',
            isImportant: false,
            category: this.determineCategory(taskData),
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
        return newTask;
    }

    determineCategory(taskData) {
        if (taskData.tags && taskData.tags.includes('Important')) return 'Important';
        if (taskData.tags && taskData.tags.includes('Work')) return 'Work';
        if (taskData.tags && taskData.tags.includes('Planning')) return 'Planning';
        return 'General';
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
        }
    }

    toggleImportant(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.isImportant = !task.isImportant;
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
            this.updateImportantCount();
        }
    }

    updateImportantCount() {
        const countElement = document.getElementById('important-count');
        if (countElement) {
            const importantCount = this.tasks.filter(task => task.isImportant).length;
            countElement.textContent = `${importantCount} task${importantCount !== 1 ? 's' : ''} starred`;
        }
    }

    renderPlannedTasks(tasks, container) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const overdueTasks = [];
        const todayTasks = [];
        const tomorrowTasks = [];
        const thisWeekTasks = [];

        tasks.forEach(task => {
            if (!task.dueDate) return;

            const dueDate = new Date(task.dueDate);
            const todayStr = today.toISOString().split('T')[0];
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const dueDateStr = dueDate.toISOString().split('T')[0];

            if (dueDateStr < todayStr) {
                overdueTasks.push(task);
            } else if (dueDateStr === todayStr) {
                todayTasks.push(task);
            } else if (dueDateStr === tomorrowStr) {
                tomorrowTasks.push(task);
            } else if (dueDate <= weekEnd) {
                thisWeekTasks.push(task);
            }
        });

        // Render each group
        this.renderDateGroup(container, 'overdue', 'Overdue', overdueTasks);
        this.renderDateGroup(container, 'today', 'Today', todayTasks);
        this.renderDateGroup(container, 'tomorrow', 'Tomorrow', tomorrowTasks);
        this.renderDateGroup(container, 'this-week', 'This Week', thisWeekTasks);
    }

    renderDateGroup(container, className, title, tasks) {
        if (tasks.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = `date-group ${className}`;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'date-group-header';
        headerDiv.innerHTML = `
            <div class="date-group-title">${title}</div>
            <div class="date-group-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</div>
        `;

        groupDiv.appendChild(headerDiv);

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            groupDiv.appendChild(taskElement);
        });

        container.appendChild(groupDiv);
    }

    updatePlannedCount() {
        const countElement = document.getElementById('planned-count');
        if (countElement) {
            const plannedCount = this.C.filter(task => task.dueDate).length;
            countElement.textContent = `${plannedCount} task${plannedCount !== 1 ? 's' : ''} scheduled`;
        }
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Page-specific filtering
        if (this.currentPage === 'important') {
            filteredTasks = filteredTasks.filter(task => task.isImportant);
        } else if (this.currentPage === 'my-day') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => task.dueDate === today);
        }

        // Search filtering
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Status filtering
        if (this.filters.status !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === this.filters.status);
        }

        // Priority filtering
        if (this.filters.priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === this.filters.priority);
        }

        return filteredTasks;
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) return;

        const filteredTasks = this.getFilteredTasks();
        
        // Clear existing tasks
        tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="text-center" style="padding: 40px; color: #6c757d;">
                    <i class="fas fa-tasks" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <h3>No tasks found</h3>
                    <p>Try adjusting your filters or add a new task.</p>
                </div>
            `;
            return;
        }

        // Render tasks based on page type
        if (this.currentPage === 'planned') {
            this.renderPlannedTasks(filteredTasks, tasksContainer);
        } else {
            // Render tasks normally
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
        }
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
        taskDiv.setAttribute('data-task-id', task.id);
        
        const isCompleted = task.status === 'done';
        
        taskDiv.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}">
                <div class="task-title ${isCompleted ? 'completed' : ''}">${task.title}</div>
                <div class="task-actions">
                    <i class="fas fa-star task-star ${task.isImportant ? '' : 'inactive'}" data-task-id="${task.id}"></i>
                    <i class="fas fa-trash task-delete" data-task-id="${task.id}"></i>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category">${task.category}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
                <span class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDueDate(task.dueDate)}
                </span>
            </div>
        `;

        return taskDiv;
    }

    formatDueDate(dueDate) {
        if (!dueDate) return 'No date';
        
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (dueDate === today) return 'Today';
        if (dueDate === tomorrow) return 'Tomorrow';
        
        const date = new Date(dueDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    updateProgress() {
        const filteredTasks = this.getFilteredTasks();
        const completedTasks = filteredTasks.filter(task => task.status === 'done');
        const totalTasks = filteredTasks.length;
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar && progressText) {
            const percentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completedTasks.length} of ${totalTasks} completed`;
        }
    }

    setupEventListeners() {
        // Task checkbox events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.toggleTaskStatus(taskId);
            }
        });

        // Star click events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-star')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.toggleImportant(taskId);
            }
        });

        // Delete button events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-delete')) {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(taskId);
                }
            }
        });

        // Filter events
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchInput = document.getElementById('searchInput');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.renderTasks();
                this.updateProgress();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.renderTasks();
                this.updateProgress();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.renderTasks();
                this.updateProgress();
            });
        }
    }
}

// Modal functionality
class ModalManager {
    constructor() {
        this.modal = document.getElementById('addTaskModal');
        this.form = document.getElementById('taskForm');
        this.selectedPriority = 'medium';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal open/close
        const addTaskBtn = document.getElementById('addTaskBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.openModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Priority selection
        const priorityOptions = document.querySelectorAll('.priority-option');
priorityOptions.forEach(option => {
            option.addEventListener('click', () => {
        priorityOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedPriority = option.getAttribute('data-priority');
    });
});

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Tags handling
        const tagsInput = document.getElementById('taskTags');
        if (tagsInput) {
            tagsInput.addEventListener('blur', () => this.updateTagsPreview());
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.getElementById('taskDueDate').valueAsDate = new Date();
            this.updateTagsPreview();
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.resetForm();
        }
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.priority-option[data-priority="medium"]').classList.add('selected');
            this.selectedPriority = 'medium';
            document.getElementById('tagsContainer').innerHTML = '';
        }
    }

    updateTagsPreview() {
        const tagsInput = document.getElementById('taskTags');
        const tagsContainer = document.getElementById('tagsContainer');
        
        if (tagsInput && tagsContainer) {
            const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    tagsContainer.innerHTML = '';
            
            tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
                tagElement.innerHTML = `${tag} <span class="tag-remove">&times;</span>`;
        tagsContainer.appendChild(tagElement);
    });
        }
    }

    handleSubmit(e) {
    e.preventDefault();
    
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const status = document.getElementById('taskStatus').value;
        const tagsInput = document.getElementById('taskTags').value;
        
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (window.taskManager) {
            window.taskManager.addTask({
        title,
        description,
        dueDate,
                priority: this.selectedPriority,
        tags,
        status
    });
        }
        
        this.closeModal();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.taskManager = new TaskManager();
    window.modalManager = new ModalManager();
    
    // Update counts based on current page
    if (window.taskManager.currentPage === 'important') {
        window.taskManager.updateImportantCount();
    } else if (window.taskManager.currentPage === 'planned') {
        window.taskManager.updatePlannedCount();
    }
});