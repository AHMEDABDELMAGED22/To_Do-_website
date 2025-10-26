class TaskManager {
    constructor() {
        this.tasks = this.getTasks();
        this.page = this.getPage();
        this.priority = 'medium';
        this.start();
    }

    start() {
        this.showDate();
        this.showTasks();
        this.showProgress();
        this.addListeners();
        this.modalSetup();
        this.counts();
    }

    getPage() {
        const url = window.location.pathname;
        if (url.includes('all-tasks')) return 'all-tasks';
        if (url.includes('important')) return 'important';
        if (url.includes('planned')) return 'planned';
        return 'my-day';
    }

    showDate() {
        const elem = document.getElementById('current-date');
        if (elem) {
            const today = new Date();
            elem.textContent = today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    getTasks() {
        const saved = localStorage.getItem('mydayTasks');
        if (saved) {
            return JSON.parse(saved);
        }
        
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
                important: true
            },
            {
                id: 2,
                title: 'Fix critical bug in production',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'todo',
                important: true
            },
            {
                id: 3,
                title: 'Buy groceries',
                dueDate: yesterday.toISOString().split('T')[0],
                priority: 'medium',
                category: 'personal',
                status: 'todo',
                important: true
            },
            {
                id: 4,
                title: 'Client meeting preparation',
                dueDate: today.toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'todo',
                important: true
            },
            {
                id: 5,
                title: 'Front End Campus',
                dueDate: today.toISOString().split('T')[0],
                priority: 'medium',
                category: 'work',
                status: 'todo',
                important: false
            },
            {
                id: 6,
                title: 'Review pull requests',
                dueDate: tomorrow.toISOString().split('T')[0],
                priority: 'medium',
                category: 'work',
                status: 'todo',
                important: false
            }
        ];
    }

    save() {
        localStorage.setItem('mydayTasks', JSON.stringify(this.tasks));
    }

    add(data) {
        const task = {
            id: Date.now(),
            title: data.title,
            dueDate: data.dueDate || '',
            priority: data.priority || 'medium',
            category: data.category || 'work',
            status: 'todo',
            important: false
        };
        
        this.tasks.push(task);
        this.save();
        this.showTasks();
        this.showProgress();
        this.counts();
    }

    remove(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.save();
        this.showTasks();
        this.showProgress();
        this.counts();
    }

    check(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            this.save();
            this.showTasks();
            this.showProgress();
        }
    }

    star(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.important = !task.important;
            this.save();
            this.showTasks();
            this.showProgress();
            this.counts();
        }
    }

    filter() {
        let result = [...this.tasks];

        if (this.page === 'important') {
            result = result.filter(task => task.important);
        } else if (this.page === 'my-day') {
            const today = new Date().toISOString().split('T')[0];
            result = result.filter(task => task.dueDate === today);
        } else if (this.page === 'planned') {
            result = result.filter(task => task.dueDate);
        }

        return result;
    }

    showTasks() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        const list = this.filter();
        container.innerHTML = '';

        if (list.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-tasks" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3>No tasks found</h3>
                    <p>Add a new task to get started.</p>
                </div>
            `;
            return;
        }

        if (this.page === 'planned') {
            this.groupByDate(list, container);
        } else {
            list.forEach(task => {
                container.appendChild(this.makeTask(task));
            });
        }
    }

    groupByDate(list, container) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const groups = {
            overdue: [],
            today: [],
            tomorrow: [],
            week: []
        };

        list.forEach(task => {
            if (!task.dueDate) return;

            if (task.dueDate < todayStr) {
                groups.overdue.push(task);
            } else if (task.dueDate === todayStr) {
                groups.today.push(task);
            } else if (task.dueDate === tomorrowStr) {
                groups.tomorrow.push(task);
            } else {
                groups.week.push(task);
            }
        });

        this.makeGroup(container, 'overdue', 'Overdue', groups.overdue);
        this.makeGroup(container, 'today', 'Today', groups.today);
        this.makeGroup(container, 'tomorrow', 'Tomorrow', groups.tomorrow);
        this.makeGroup(container, 'this-week', 'This Week', groups.week);
    }

    makeGroup(container, cls, title, list) {
        if (list.length === 0) return;

        const div = document.createElement('div');
        div.className = `date-group ${cls}`;
        div.innerHTML = `
            <div class="date-group-header">
                <div class="date-group-title">${title}</div>
                <div class="date-group-count">${list.length} task${list.length !== 1 ? 's' : ''}</div>
            </div>
        `;

        list.forEach(task => {
            div.appendChild(this.makeTask(task));
        });

        container.appendChild(div);
    }

    makeTask(task) {
        const div = document.createElement('div');
        div.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
        
        const star = task.important ? 'fas fa-star' : 'far fa-star';
        
        div.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''} data-task-id="${task.id}">
                <div class="task-title ${task.status === 'done' ? 'completed' : ''}">${task.title}</div>
                <div class="task-actions">
                    <i class="${star} task-star" data-task-id="${task.id}"></i>
                    <i class="fas fa-trash task-delete" data-task-id="${task.id}"></i>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                <span class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    ${this.dateText(task.dueDate)}
                </span>
            </div>
        `;

        return div;
    }

    dateText(date) {
        if (!date) return 'No date';
        
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (date === today) return 'Today';
        if (date === tomorrow) return 'Tomorrow';
        
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    showProgress() {
        const list = this.filter();
        const done = list.filter(task => task.status === 'done');
        const total = list.length;
        
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        
        if (bar && text) {
            const percent = total > 0 ? (done.length / total) * 100 : 0;
            bar.style.width = `${percent}%`;
            text.textContent = `${done.length} of ${total} completed`;
        }
    }

    counts() {
        const impCount = document.getElementById('important-count');
        if (impCount) {
            const num = this.tasks.filter(task => task.important).length;
            impCount.textContent = `${num} task${num !== 1 ? 's' : ''} starred`;
        }

        const planCount = document.getElementById('planned-count');
        if (planCount) {
            const num = this.tasks.filter(task => task.dueDate).length;
            planCount.textContent = `${num} task${num !== 1 ? 's' : ''} scheduled`;
        }
    }

    addListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.check(parseInt(e.target.dataset.taskId));
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-star')) {
                this.star(parseInt(e.target.dataset.taskId));
            }
            if (e.target.classList.contains('task-delete')) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.remove(parseInt(e.target.dataset.taskId));
                }
            }
        });

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const f = tab.dataset.filter;
                const list = f === 'all' ? this.tasks : this.tasks.filter(task => task.category === f);
                
                const container = document.getElementById('tasksContainer');
                container.innerHTML = '';
                list.forEach(task => {
                    container.appendChild(this.makeTask(task));
                });
                this.showProgress();
            });
        });
    }

    modalSetup() {
        const modal = document.getElementById('addTaskModal');
        const btn = document.getElementById('addTaskBtn');
        const cancel = document.getElementById('cancelBtn');
        const form = document.getElementById('taskForm');

        if (!modal || !btn) return;

        btn.addEventListener('click', () => {
            modal.style.display = 'flex';
            const date = document.getElementById('taskDueDate');
            if (date) date.valueAsDate = new Date();
        });

        if (cancel) {
            cancel.addEventListener('click', () => {
                modal.style.display = 'none';
                form.reset();
                this.priority = 'medium';
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                form.reset();
                this.priority = 'medium';
            }
        });

        document.querySelectorAll('.priority-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.priority-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                this.priority = opt.dataset.priority;
            });
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const cat = document.getElementById('taskCategory');
                
                this.add({
                    title: document.getElementById('taskTitle').value,
                    dueDate: document.getElementById('taskDueDate').value,
                    priority: this.priority,
                    category: cat ? cat.value : 'work'
                });
                
                modal.style.display = 'none';
                form.reset();
                document.querySelectorAll('.priority-option').forEach(o => o.classList.remove('selected'));
                document.querySelector('.priority-option[data-priority="medium"]').classList.add('selected');
                this.priority = 'medium';
            });
        }
    }
}

// Start app when page loads
window.addEventListener('load', function() {
    window.taskManager = new TaskManager();
});