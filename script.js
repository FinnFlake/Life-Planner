// DOM Elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const themeToggle = document.querySelector('.theme-toggle');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');
const editTaskInput = document.getElementById('editTaskInput');
const editCategorySelect = document.getElementById('editCategorySelect');
const saveTaskBtn = document.getElementById('saveTaskBtn');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentCategory = 'all';
let editingTaskId = null;

// Initialize the app
function init() {
    renderTasks();
    updateStats();
    
    // Check if dark theme is enabled
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    
    if (taskText === '') return;
    
    const newTask = {
        id: generateId(),
        text: taskText,
        category: category,
        completed: false,
        date: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    taskInput.value = '';
    taskInput.focus();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// Toggle task completion
function toggleTaskComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateStats();
}

// Open edit modal
function openEditModal(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    editingTaskId = id;
    editTaskInput.value = task.text;
    editCategorySelect.value = task.category;
    
    editModal.style.display = 'block';
}

// Save edited task
function saveEditedTask() {
    if (!editingTaskId) return;
    
    const taskText = editTaskInput.value.trim();
    const category = editCategorySelect.value;
    
    if (taskText === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return { ...task, text: taskText, category: category };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    
    editModal.style.display = 'none';
    editingTaskId = null;
}

// Filter tasks based on current filters
function filterTasks() {
    let filteredTasks = [...tasks];
    
    // Apply status filter
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
    }
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }
    
    return filteredTasks;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Render tasks
function renderTasks() {
    const filteredTasks = filterTasks();
    
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <li class="task-item" style="justify-content: center; grid-template-columns: 1fr;">
                <p style="text-align: center; padding: 20px; color: var(--text-color); opacity: 0.7;">
                    No tasks found. Add a new task to get started!
                </p>
            </li>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        taskItem.innerHTML = `
            <div class="task-check">
                <div class="checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
            </div>
            <div class="task-name">${task.text}</div>
            <div class="task-category">
                <span class="${task.category}">${task.category}</span>
            </div>
            <div class="task-date">${formatDate(task.date)}</div>
            <div class="task-actions">
                <div class="action-btn edit-btn" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="action-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        tasksList.appendChild(taskItem);
    });
    
    // Add event listeners to checkboxes and buttons
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', () => {
            const id = checkbox.getAttribute('data-id');
            toggleTaskComplete(id);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteTask(id);
        });
    });
}

// Update stats
function updateStats() {
    totalTasksEl.textContent = tasks.length;
    completedTasksEl.textContent = tasks.filter(task => task.completed).length;
    pendingTasksEl.textContent = tasks.filter(task => !task.completed).length;
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

searchInput.addEventListener('input', renderTasks);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderTasks();
    });
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
});

closeModal.addEventListener('click', () => {
    editModal.style.display = 'none';
});

saveTaskBtn.addEventListener('click', saveEditedTask);

window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Initialize app
init();
