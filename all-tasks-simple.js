// Simple All Tasks Page JavaScript
// This is beginner-friendly code for the All Tasks page

// Sample tasks data - this is like a simple database
let allTasks = [
    {
        id: 1,
        title: "Design new landing page",
        category: "work",
        dueDate: "Oct 6",
        isImportant: true,
        isCompleted: false
    },
    {
        id: 2,
        title: "Review pull requests",
        category: "work",
        dueDate: "Oct 8",
        isImportant: false,
        isCompleted: false
    },
    {
        id: 3,
        title: "Update documentation",
        category: "work",
        dueDate: "Oct 12",
        isImportant: false,
        isCompleted: false
    },
    {
        id: 4,
        title: "Fix critical bug in production",
        category: "work",
        dueDate: "Oct 6",
        isImportant: true,
        isCompleted: false
    },
    {
        id: 5,
        title: "Setup CI/CD pipeline",
        category: "work",
        dueDate: "Oct 5",
        isImportant: false,
        isCompleted: true
    },
    {
        id: 6,
        title: "Client meeting preparation",
        category: "work",
        dueDate: "Today",
        isImportant: true,
        isCompleted: false
    },
    {
        id: 7,
        title: "Read monthly reports",
        category: "work",
        dueDate: "Oct 6",
        isImportant: false,
        isCompleted: true
    },
    {
        id: 8,
        title: "Front End Campus",
        category: "work",
        dueDate: "Today",
        isImportant: false,
        isCompleted: false
    },
    {
        id: 9,
        title: "Buy groceries",
        category: "personal",
        dueDate: "Oct 6",
        isImportant: true,
        isCompleted: false
    },
    {
        id: 10,
        title: "Schedule dentist appointment",
        category: "personal",
        dueDate: "Oct 9",
        isImportant: false,
        isCompleted: false
    },
    {
        id: 11,
        title: "Plan weekend trip",
        category: "personal",
        dueDate: "Oct 10",
        isImportant: true,
        isCompleted: false
    }
];

// Current filter - starts with "all"
let currentFilter = "all";

// Function to show tasks based on the selected filter
function showTasks() {
    // Get the container where we will put the tasks
    let container = document.getElementById("tasksContainer");
    
    // Clear the container first
    container.innerHTML = "";
    
    // Filter tasks based on current filter
    let filteredTasks = allTasks;
    if (currentFilter !== "all") {
        filteredTasks = allTasks.filter(task => task.category === currentFilter);
    }
    
    // Count completed tasks
    let completedCount = filteredTasks.filter(task => task.isCompleted).length;
    let totalCount = filteredTasks.length;
    
    // Update progress bar
    updateProgress(completedCount, totalCount);
    
    // Create HTML for each task
    filteredTasks.forEach(task => {
        let taskHTML = createTaskHTML(task);
        container.innerHTML += taskHTML;
    });
    
    // Add event listeners to checkboxes
    addCheckboxListeners();
    
    // Add event listeners to star buttons
    addStarListeners();
    
    // Add event listeners to delete buttons
    addDeleteListeners();
}

// Function to create HTML for a single task
function createTaskHTML(task) {
    let checked = task.isCompleted ? "checked" : "";
    let starClass = task.isImportant ? "fas fa-star" : "far fa-star";
    let completedClass = task.isCompleted ? "completed" : "";
    
    return `
        <div class="task-card ${completedClass}">
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${checked} data-task-id="${task.id}">
                <div class="task-title ${completedClass}">${task.title}</div>
                <div class="task-actions">
                    <i class="${starClass} task-star" data-task-id="${task.id}"></i>
                    <i class="fas fa-trash task-delete" data-task-id="${task.id}"></i>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-category">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                <span class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    ${task.dueDate}
                </span>
            </div>
        </div>
    `;
}

// Function to update progress bar
function updateProgress(completed, total) {
    let progressBar = document.getElementById("progressBar");
    let progressText = document.getElementById("progressText");
    
    if (total === 0) {
        progressBar.style.width = "0%";
        progressText.textContent = "0 of 0 completed";
    } else {
        let percentage = (completed / total) * 100;
        progressBar.style.width = percentage + "%";
        progressText.textContent = `${completed} of ${total} completed`;
    }
}

// Function to add event listeners to checkboxes
function addCheckboxListeners() {
    let checkboxes = document.querySelectorAll(".task-checkbox");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            let taskId = parseInt(this.getAttribute("data-task-id"));
            toggleTaskCompletion(taskId);
        });
    });
}

// Function to add event listeners to star buttons
function addStarListeners() {
    let stars = document.querySelectorAll(".task-star");
    stars.forEach(star => {
        star.addEventListener("click", function() {
            let taskId = parseInt(this.getAttribute("data-task-id"));
            toggleTaskImportance(taskId);
        });
    });
}

// Function to add event listeners to delete buttons
function addDeleteListeners() {
    let deleteButtons = document.querySelectorAll(".task-delete");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function() {
            let taskId = parseInt(this.getAttribute("data-task-id"));
            deleteTask(taskId);
        });
    });
}

// Function to toggle task completion
function toggleTaskCompletion(taskId) {
    let task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.isCompleted = !task.isCompleted;
        showTasks(); // Refresh the display
    }
}

// Function to toggle task importance
function toggleTaskImportance(taskId) {
    let task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.isImportant = !task.isImportant;
        showTasks(); // Refresh the display
    }
}

// Function to delete a task
function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        allTasks = allTasks.filter(t => t.id !== taskId);
        showTasks(); // Refresh the display
    }
}

// Function to handle filter button clicks
function setupFilterButtons() {
    let filterButtons = document.querySelectorAll(".filter-tab");
    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            
            // Add active class to clicked button
            this.classList.add("active");
            
            // Update current filter
            currentFilter = this.getAttribute("data-filter");
            
            // Show tasks with new filter
            showTasks();
        });
    });
}

// Function to setup modal (Add Task button)
function setupModal() {
    let addButton = document.getElementById("addTaskBtn");
    let modal = document.getElementById("addTaskModal");
    let cancelButton = document.getElementById("cancelBtn");
    let form = document.getElementById("taskForm");
    
    // Open modal when Add Task button is clicked
    addButton.addEventListener("click", function() {
        modal.style.display = "flex";
    });
    
    // Close modal when Cancel button is clicked
    cancelButton.addEventListener("click", function() {
        modal.style.display = "none";
        form.reset();
    });
    
    // Close modal when clicking outside
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
            form.reset();
        }
    });
    
    // Handle form submission
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        addNewTask();
    });
}

// Function to add a new task
function addNewTask() {
    let title = document.getElementById("taskTitle").value;
    let category = document.getElementById("taskCategory").value;
    let dueDate = document.getElementById("taskDueDate").value;
    
    if (title.trim() === "") {
        alert("Please enter a task title!");
        return;
    }
    
    // Create new task
    let newTask = {
        id: Date.now(), // Simple ID generation
        title: title,
        category: category,
        dueDate: dueDate || "No date",
        isImportant: false,
        isCompleted: false
    };
    
    // Add to tasks array
    allTasks.push(newTask);
    
    // Close modal and reset form
    document.getElementById("addTaskModal").style.display = "none";
    document.getElementById("taskForm").reset();
    
    // Refresh display
    showTasks();
}

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", function() {
    showTasks(); // Show initial tasks
    setupFilterButtons(); // Setup filter buttons
    setupModal(); // Setup modal functionality
});
