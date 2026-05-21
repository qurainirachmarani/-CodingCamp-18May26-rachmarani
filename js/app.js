/**
 * Todo-Life Dashboard — app.js
 * Pure HTML/CSS/Vanilla JS. No frameworks, no build tools.
 * All state persisted in localStorage.
 */

'use strict';

/* ============================================================
   Utility
   ============================================================ */

/**
 * Generate a unique ID.
 * Uses crypto.randomUUID() when available, falls back to timestamp + random.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ============================================================
   Greeting Widget
   ============================================================ */

/**
 * Return a time-of-day greeting based on the given hour (0–23).
 * @param {number} hour
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 20) return 'Good Evening';
  return 'Good Night'; // 21–23 and 0–4
}

/**
 * Format a Date object as zero-padded "HH:MM".
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Format a Date object as "Weekday, DD Month YYYY".
 * e.g. "Monday, 18 May 2026"
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months   = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekday = weekdays[date.getDay()];
  const day     = date.getDate();
  const month   = months[date.getMonth()];
  const year    = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Read the current time and update all three greeting DOM elements.
 */
function updateGreetingWidget() {
  const now = new Date();
  const greetingEl = document.getElementById('greeting-text');
  const timeEl     = document.getElementById('current-time');
  const dateEl     = document.getElementById('current-date');

  if (greetingEl) greetingEl.textContent = getGreeting(now.getHours());
  if (timeEl)     timeEl.textContent     = formatTime(now);
  if (dateEl)     dateEl.textContent     = formatDate(now);
}

/* ============================================================
   Focus Timer
   ============================================================ */

/** @type {number} Remaining seconds on the timer */
let timerSeconds = 1500; // 25 * 60

/** @type {number|null} setInterval handle; null when not running */
let timerInterval = null;

/**
 * Format a seconds value as zero-padded "MM:SS".
 * @param {number} seconds
 * @returns {string}
 */
function formatTimerDisplay(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Write the current timerSeconds value to #timer-display.
 */
function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTimerDisplay(timerSeconds);
}

/**
 * Decrement timerSeconds by 1, update the display, and fire onTimerComplete
 * when the countdown reaches zero.
 */
function tickTimer() {
  timerSeconds -= 1;
  updateTimerDisplay();
  if (timerSeconds <= 0) {
    timerSeconds = 0;
    onTimerComplete();
  }
}

/**
 * Start the countdown. Guards against double-start.
 */
function startTimer() {
  if (timerInterval !== null) return; // already running
  if (timerSeconds <= 0) return;      // nothing to count down
  timerInterval = setInterval(tickTimer, 1000);
}

/**
 * Pause the countdown, retaining the current remaining time.
 */
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Stop any active countdown and restore the timer to 25:00.
 */
function resetTimer() {
  stopTimer();
  timerSeconds = 1500;
  const msg = document.getElementById('timer-complete-msg');
  if (msg) msg.classList.remove('visible');
  updateTimerDisplay();
}

/**
 * Called when the countdown reaches 00:00.
 * Stops the timer and shows the completion message.
 */
function onTimerComplete() {
  stopTimer();
  const msg = document.getElementById('timer-complete-msg');
  if (msg) msg.classList.add('visible');
}

/* ============================================================
   Todo List — Data Layer
   ============================================================ */

const TASKS_KEY = 'todo-life-tasks';

/**
 * Read the task array from localStorage.
 * Returns [] on missing key or parse error.
 * @returns {Array<{id:string, text:string, completed:boolean}>}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/**
 * Persist the task array to localStorage.
 * @param {Array<{id:string, text:string, completed:boolean}>} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (_) {
    // Private browsing / quota exceeded — continue with in-memory state
  }
}

/* ============================================================
   Todo List — DOM Layer
   ============================================================ */

/**
 * Build a <li> element for a single task.
 * @param {{id:string, text:string, completed:boolean}} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'task-toggle';
  toggleBtn.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
  toggleBtn.textContent = '✓';
  toggleBtn.addEventListener('click', () => toggleTask(task.id));

  // Text span
  const textSpan = document.createElement('span');
  textSpan.className = 'task-text';
  textSpan.textContent = task.text;

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'task-edit';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.textContent = '✎';
  editBtn.addEventListener('click', () => startInlineEdit(li, task));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(toggleBtn);
  li.appendChild(textSpan);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Replace the task text span with an inline input for editing.
 * Confirms on Enter or blur; discards on Escape.
 * @param {HTMLLIElement} li
 * @param {{id:string, text:string, completed:boolean}} task
 */
function startInlineEdit(li, task) {
  const textSpan = li.querySelector('.task-text');
  if (!textSpan) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task text');

  let confirmed = false;

  function confirm() {
    if (confirmed) return;
    confirmed = true;
    const newText = input.value;
    editTask(task.id, newText);
  }

  function discard() {
    if (confirmed) return;
    confirmed = true;
    // Re-render to restore original span
    renderTasks(tasks);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      discard();
    }
  });

  input.addEventListener('blur', confirm);

  li.replaceChild(input, textSpan);
  input.focus();
  input.select();
}

/**
 * Clear and re-render the entire #todo-list from the tasks array.
 * @param {Array<{id:string, text:string, completed:boolean}>} taskList
 */
function renderTasks(taskList) {
  const ul = document.getElementById('todo-list');
  if (!ul) return;
  ul.innerHTML = '';
  taskList.forEach((task) => ul.appendChild(createTaskElement(task)));
}

/* ============================================================
   Todo List — Actions
   ============================================================ */

/**
 * Add a new task. Validates non-empty text.
 * @param {string} text
 */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    const input = document.getElementById('todo-input');
    if (input) input.focus();
    return;
  }
  const task = { id: generateId(), text: trimmed, completed: false };
  tasks.push(task);
  saveTasks(tasks);
  renderTasks(tasks);
  const input = document.getElementById('todo-input');
  if (input) {
    input.value = '';
    input.focus();
  }
}

/**
 * Update the text of an existing task.
 * If newText is empty/whitespace, the original text is restored.
 * @param {string} id
 * @param {string} newText
 */
function editTask(id, newText) {
  const trimmed = newText.trim();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  if (trimmed) {
    task.text = trimmed;
    saveTasks(tasks);
  }
  // Re-render regardless (restores span whether edit was accepted or discarded)
  renderTasks(tasks);
}

/**
 * Flip the completed state of a task.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks(tasks);
}

/**
 * Permanently remove a task by id.
 * @param {string} id
 */
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  renderTasks(tasks);
}

/* ============================================================
   Quick Links — Data Layer
   ============================================================ */

const LINKS_KEY = 'todo-life-links';

/**
 * Read the links array from localStorage.
 * Returns [] on missing key or parse error.
 * @returns {Array<{id:string, label:string, url:string}>}
 */
function loadLinks() {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/**
 * Persist the links array to localStorage.
 * @param {Array<{id:string, label:string, url:string}>} linkList
 */
function saveLinks(linkList) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(linkList));
  } catch (_) {
    // Private browsing / quota exceeded — continue with in-memory state
  }
}

/* ============================================================
   Quick Links — DOM Layer
   ============================================================ */

/**
 * Build a .link-item div for a single link.
 * @param {{id:string, label:string, url:string}} link
 * @returns {HTMLDivElement}
 */
function createLinkElement(link) {
  const div = document.createElement('div');
  div.className = 'link-item';
  div.dataset.id = link.id;

  const anchor = document.createElement('a');
  anchor.href = link.url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.textContent = link.label;
  anchor.title = link.url;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'link-delete';
  deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', () => deleteLink(link.id));

  div.appendChild(anchor);
  div.appendChild(deleteBtn);

  return div;
}

/**
 * Clear and re-render the entire #links-container from the links array.
 * @param {Array<{id:string, label:string, url:string}>} linkList
 */
function renderLinks(linkList) {
  const container = document.getElementById('links-container');
  if (!container) return;
  container.innerHTML = '';
  linkList.forEach((link) => container.appendChild(createLinkElement(link)));
}

/* ============================================================
   Quick Links — Actions
   ============================================================ */

/**
 * Add a new link. Validates both label and url are non-empty.
 * @param {string} label
 * @param {string} url
 */
function addLink(label, url) {
  const trimLabel = label.trim();
  const trimUrl   = url.trim();
  if (!trimLabel || !trimUrl) return;

  const link = { id: generateId(), label: trimLabel, url: trimUrl };
  links.push(link);
  saveLinks(links);
  renderLinks(links);

  const labelInput = document.getElementById('link-label-input');
  const urlInput   = document.getElementById('link-url-input');
  if (labelInput) labelInput.value = '';
  if (urlInput)   urlInput.value   = '';
  if (labelInput) labelInput.focus();
}

/**
 * Permanently remove a link by id.
 * @param {string} id
 */
function deleteLink(id) {
  links = links.filter((l) => l.id !== id);
  saveLinks(links);
  renderLinks(links);
}

/* ============================================================
   In-memory State
   ============================================================ */

/** @type {Array<{id:string, text:string, completed:boolean}>} */
let tasks = loadTasks();

/** @type {Array<{id:string, label:string, url:string}>} */
let links = loadLinks();

/* ============================================================
   Initialisation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Greeting Widget ---
  updateGreetingWidget();
  setInterval(updateGreetingWidget, 60000);

  // --- Focus Timer ---
  updateTimerDisplay();

  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  // --- Todo List ---
  renderTasks(tasks);

  document.getElementById('todo-add-btn').addEventListener('click', () => {
    const input = document.getElementById('todo-input');
    addTask(input ? input.value : '');
  });

  document.getElementById('todo-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(e.target.value);
    }
  });

  // --- Quick Links ---
  renderLinks(links);

  document.getElementById('link-add-btn').addEventListener('click', () => {
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    addLink(
      labelInput ? labelInput.value : '',
      urlInput   ? urlInput.value   : ''
    );
  });

  // Allow pressing Enter in either link input to submit
  ['link-label-input', 'link-url-input'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const labelInput = document.getElementById('link-label-input');
          const urlInput   = document.getElementById('link-url-input');
          addLink(
            labelInput ? labelInput.value : '',
            urlInput   ? urlInput.value   : ''
          );
        }
      });
    }
  });
});

/* ============================================================
   Module Exports (Jest / Node.js compatibility)
   ============================================================ */

if (typeof module !== 'undefined') {
  module.exports = {
    // Greeting Widget
    getGreeting,
    formatTime,
    formatDate,
    updateGreetingWidget,
    // Focus Timer
    formatTimerDisplay,
    updateTimerDisplay,
    startTimer,
    stopTimer,
    resetTimer,
    tickTimer,
    onTimerComplete,
    // Todo List
    loadTasks,
    saveTasks,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    renderTasks,
    // Quick Links
    loadLinks,
    saveLinks,
    addLink,
    deleteLink,
    renderLinks,
  };
}
