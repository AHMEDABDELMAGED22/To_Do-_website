// ===== Simplified Task Manager =====

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentPage = this.getCurrentPage();
        this.selectedPriority = 'medium';
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.renderTasks();
        this.updateProgress();
        this.setupEventListeners();
        this.setupModal();
        this.updateCounts();
    }

    // === PAGE DETECTION ===
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('all-tasks')) return 'all-tasks';
        if (path.includes('important')) return 'important';
        if (path.includes('planned')) return 'planned';
        return 'my-day';
    }

    // === DATE UPDATE ===
    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    // === LOAD TASKS FROM STORAGE ===
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

        return [
            {
                id: 1,
                title: 'Design new landing page',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'todo',
                isImportant: true
            },
            {
                id: 2,
                title: 'Fix critical bug in production',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'todo',
                isImportant: true
            },
            {
                id: 3,
                title: 'Buy groceries',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'medium',
                category: 'personal',
                status: 'todo',
                isImportant: true
            },
            {
                id: 4,
                title: 'Client meeting preparation',
                dueDate: today.toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'todo',
                isImportant: true
            },
            {
                id: 5,
                title: 'Front End Campus',
                dueDate: today.toISOString().split('T')[0],
                priority: 'medium',
                category: 'work',
                status: 'todo',
                isImportant: false
            },
            {
                id: 6,
                title: 'Review pull requests',
                dueDate: tomorrow.toISOString().split('T')[0],
                priority: 'medium',
                category: 'work',
                status: 'todo',
                isImportant: false
            }
        ];
    }

    // === SAVE TASKS ===
    saveTasks() {
        localStorage.setItem('mydayTasks', JSON.stringify(this.tasks));
    }

    // === ADD NEW TASK ===
    addTask(taskData) {
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            dueDate: taskData.dueDate || '',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'work',
            status: 'todo',
            isImportant: false
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
        this.updateCounts();
    }

    // === DELETE TASK ===
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
        this.updateCounts();
    }

    // === TOGGLE TASK COMPLETION ===
    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
        }
    }

    // === TOGGLE IMPORTANT ===
    toggleImportant(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.isImportant = !task.isImportant;
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
            this.updateCounts();
        }
    }

    // === GET FILTERED TASKS ===
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        if (this.currentPage === 'important') {
            filteredTasks = filteredTasks.filter(task => task.isImportant);
        } else if (this.currentPage === 'my-day') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => task.dueDate === today);
        } else if (this.currentPage === 'planned') {
            filteredTasks = filteredTasks.filter(task => task.dueDate);
        }

        return filteredTasks;
    }

    // === RENDER TASKS ===
    renderTasks() {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) return;

        const filteredTasks = this.getFilteredTasks();
        tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-tasks" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3>No tasks found</h3>
                    <p>Add a new task to get started.</p>
                </div>
            `;
            return;
        }

        // Render planned tasks with date groups
        if (this.currentPage === 'planned') {
            this.renderPlannedTasks(filteredTasks, tasksContainer);
        } else {
            // Render normal tasks
            filteredTasks.forEach(task => {
                tasksContainer.appendChild(this.createTaskElement(task));
            });
        }
    }

    // === RENDER PLANNED TASKS WITH DATE GROUPS ===
    renderPlannedTasks(tasks, container) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const groups = {
            overdue: [],
            today: [],
            tomorrow: [],
            thisWeek: []
        };

        tasks.forEach(task => {
            if (!task.dueDate) return;

            if (task.dueDate < todayStr) {
                groups.overdue.push(task);
            } else if (task.dueDate === todayStr) {
                groups.today.push(task);
            } else if (task.dueDate === tomorrowStr) {
                groups.tomorrow.push(task);
            } else {
                groups.thisWeek.push(task);
            }
        });

        this.renderDateGroup(container, 'overdue', 'Overdue', groups.overdue);
        this.renderDateGroup(container, 'today', 'Today', groups.today);
        this.renderDateGroup(container, 'tomorrow', 'Tomorrow', groups.tomorrow);
        this.renderDateGroup(container, 'this-week', 'This Week', groups.thisWeek);
    }

    // === RENDER DATE GROUP ===
    renderDateGroup(container, className, title, tasks) {
        if (tasks.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = `date-group ${className}`;
        groupDiv.innerHTML = `
            <div class="date-group-header">
                <div class="date-group-title">${title}</div>
                <div class="date-group-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</div>
            </div>
        `;

        tasks.forEach(task => {
            groupDiv.appendChild(this.createTaskElement(task));
        });

        container.appendChild(groupDiv);
    }

    // === CREATE TASK ELEMENT ===
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
        
        const starClass = task.isImportant ? 'fas fa-star' : 'far fa-star';
        
        taskDiv.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''} data-task-id="${task.id}">
                <div class="task-title ${task.status === 'done' ? 'completed' : ''}">${task.title}</div>
                <div class="task-actions">
                    <i class="${starClass} task-star" data-task-id="${task.id}"></i>
                    <i class="fas fa-trash task-delete" data-task-id="${task.id}"></i>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                <span class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDueDate(task.dueDate)}
                </span>
            </div>
        `;

        return taskDiv;
    }

    // === FORMAT DUE DATE ===
    formatDueDate(dueDate) {
        if (!dueDate) return 'No date';
        
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (dueDate === today) return 'Today';
        if (dueDate === tomorrow) return 'Tomorrow';
        
        const date = new Date(dueDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // === UPDATE PROGRESS BAR ===
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

    // === UPDATE PAGE COUNTS ===
    updateCounts() {
        // Important count
        const importantCount = document.getElementById('important-count');
        if (importantCount) {
            const count = this.tasks.filter(task => task.isImportant).length;
            importantCount.textContent = `${count} task${count !== 1 ? 's' : ''} starred`;
        }

        // Planned count
        const plannedCount = document.getElementById('planned-count');
        if (plannedCount) {
            const count = this.tasks.filter(task => task.dueDate).length;
            plannedCount.textContent = `${count} task${count !== 1 ? 's' : ''} scheduled`;
        }
    }

    // === SETUP EVENT LISTENERS ===
    setupEventListeners() {
        // Checkbox events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskStatus(parseInt(e.target.dataset.taskId));
            }
        });

        // Star and delete button events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-star')) {
                this.toggleImportant(parseInt(e.target.dataset.taskId));
            }
            if (e.target.classList.contains('task-delete')) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(parseInt(e.target.dataset.taskId));
                }
            }
        });

        // Filter tabs (for All Tasks page)
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const filter = tab.dataset.filter;
                const filteredTasks = filter === 'all' 
                    ? this.tasks 
                    : this.tasks.filter(task => task.category === filter);
                
                const tasksContainer = document.getElementById('tasksContainer');
                tasksContainer.innerHTML = '';
                filteredTasks.forEach(task => {
                    tasksContainer.appendChild(this.createTaskElement(task));
                });
                this.updateProgress();
            });
        });
    }

    // === SETUP MODAL ===
    setupModal() {
        const modal = document.getElementById('addTaskModal');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('taskForm');

        if (!modal || !addTaskBtn) return;

        // Open modal
        addTaskBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            const dateInput = document.getElementById('taskDueDate');
            if (dateInput) dateInput.valueAsDate = new Date();
        });

        // Close modal
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                form.reset();
                this.selectedPriority = 'medium';
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                form.reset();
                this.selectedPriority = 'medium';
            }
        });

        // Priority selection
        document.querySelectorAll('.priority-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedPriority = option.dataset.priority;
            });
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const categorySelect = document.getElementById('taskCategory');
                
                this.addTask({
                    title: document.getElementById('taskTitle').value,
                    dueDate: document.getElementById('taskDueDate').value,
                    priority: this.selectedPriority,
                    category: categorySelect ? categorySelect.value : 'work'
                });
                
                modal.style.display = 'none';
                form.reset();
                document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
                document.querySelector('.priority-option[data-priority="medium"]').classList.add('selected');
                this.selectedPriority = 'medium';
            });
        }
    }
}

// === INITIALIZE APP ===
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});