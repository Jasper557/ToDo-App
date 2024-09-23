// Event Listener für den Hinzufügen-Button
document.getElementById('addTaskButton').addEventListener('click', addTask);

// Lade Aufgaben beim Seitenaufruf
window.onload = loadTasks;

// Aufgabe hinzufügen
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskLinkInput = document.getElementById('taskLinkInput');
    const taskText = taskInput.value.trim();
    const taskLink = taskLinkInput.value.trim();

    if (taskText === '') {
        alert('Bitte eine Aufgabe eingeben');
        return;
    }

    const taskData = parseTaskForLink(taskText, taskLink);
    const taskList = document.getElementById('taskList');
    const newTask = createTaskElement(taskText, taskLink, taskData.url);

    saveTaskToLocalStorage(taskText, taskLink);
    taskList.appendChild(newTask);
    
    taskInput.value = '';
    taskLinkInput.value = '';
}

// Neues Aufgaben-Element erstellen
function createTaskElement(taskText, taskLink, taskUrl) {
    const newTask = document.createElement('li');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    newTask.innerHTML = `
        <span class="task-name">${taskText}</span>
        <span class="ticket-number" style="display:none;" data-link="${taskUrl}">${taskLink}</span>
        <button class="close-button" onclick="removeTask(this)">x</button>
    `;

    // Tooltip-Ereignisse
    newTask.addEventListener('mouseenter', () => {
        tooltip.textContent = taskLink.startsWith('#') ? `Ticket: ${taskLink}` : `PR: ${taskLink}`;
        tooltip.style.display = 'block';
    });

    newTask.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    newTask.addEventListener('mousemove', (e) => {
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
    });

    newTask.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.open(taskUrl, '_blank');
    });

    newTask.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            newTask.classList.toggle('completed');
        }
    });

    return newTask;
}

// Aufgabe entfernen
function removeTask(button) {
    const taskItem = button.parentElement;
    const taskName = taskItem.querySelector('.task-name').textContent;
    const taskLink = taskItem.querySelector('.ticket-number').textContent;

    // Tooltip verstecken
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }

    removeTaskFromLocalStorage(taskName, taskLink);
    taskItem.remove();
}

// Link zur Aufgabe parsen
function parseTaskForLink(taskText, taskLink) {
    let url = '';
    if (taskLink === '') return { text: taskText, url: '' };

    url = taskLink.startsWith('#') 
        ? `https://service.slu-gmbh.de/issues/${taskLink.substring(1)}` 
        : `http://hygitea.localdomain/SLU/oktopuspro/pulls/${taskLink}`;

    return { text: taskText, url: url };
}

// Aufgaben aus localStorage laden
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const taskData = parseTaskForLink(task.text, task.link);
        const newTask = createTaskElement(task.text, task.link, taskData.url);
        document.getElementById('taskList').appendChild(newTask);
    });
}

// Aufgabe im localStorage speichern
function saveTaskToLocalStorage(taskText, taskLink) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, link: taskLink });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Aufgabe aus localStorage entfernen
function removeTaskFromLocalStorage(taskName, taskLink) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => !(task.text === taskName && task.link === taskLink));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}