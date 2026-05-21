# Design Document: Todo-Life Dashboard

## Overview

The Todo-Life Dashboard is a single-page, client-side productivity application built with plain HTML, CSS, and Vanilla JavaScript. It requires no build tools, no frameworks, and no backend server. All state is persisted in the browser's `localStorage`. The app is structured as three static files:

- `index.html` — markup and widget scaffolding
- `css/style.css` — all visual styles
- `js/app.js` — all behaviour and state management

The four widgets (Greeting, Focus Timer, Todo List, Quick Links) are rendered inside a single page and operate independently of each other.

---

## Architecture

```
index.html
├── <link> css/style.css
└── <script> js/app.js (deferred)

js/app.js
├── GreetingWidget   — reads system clock, updates DOM every minute
├── FocusTimer       — manages countdown state with setInterval
├── TodoList         — CRUD operations + localStorage sync
└── QuickLinks       — CRUD operations + localStorage sync
```

Each widget is a self-contained module implemented as a plain JavaScript object/IIFE. They share no mutable state with each other. `localStorage` is the only shared persistence layer.

### Data Flow

```
User Interaction
      │
      ▼
  DOM Event Handler (js/app.js)
      │
      ▼
  State Mutation (in-memory array / timer variable)
      │
      ├──► DOM Update (re-render affected widget section)
      └──► localStorage.setItem (serialise to JSON)

Page Load
      │
      ▼
  localStorage.getItem → JSON.parse → in-memory state → render
```

---

## Components and Interfaces

### 1. GreetingWidget

**Responsibility**: Display current time, date, and time-of-day greeting. Refresh every minute.

**DOM Elements**:
- `#greeting-text` — greeting string ("Good Morning", etc.)
- `#current-time` — HH:MM formatted time
- `#current-date` — human-readable date string

**Key Functions**:
```js
function getGreeting(hour)        // Returns greeting string based on hour (0–23)
function formatTime(date)         // Returns "HH:MM" string
function formatDate(date)         // Returns "Weekday, DD Month YYYY" string
function updateGreetingWidget()   // Reads Date(), updates all three DOM elements
```

**Initialisation**: Call `updateGreetingWidget()` on page load, then `setInterval(updateGreetingWidget, 60000)`.

**Greeting Logic**:
| Hour range | Message        |
|------------|----------------|
| 05–11      | Good Morning   |
| 12–17      | Good Afternoon |
| 18–20      | Good Evening   |
| 21–04      | Good Night     |

---

### 2. FocusTimer

**Responsibility**: 25-minute countdown with start, stop, and reset controls.

**DOM Elements**:
- `#timer-display` — MM:SS formatted remaining time
- `#timer-start` — start button
- `#timer-stop` — stop/pause button
- `#timer-reset` — reset button
- `#timer-complete-msg` — hidden message shown when timer reaches 00:00

**State Variables**:
```js
let timerSeconds = 1500;   // 25 * 60
let timerInterval = null;  // setInterval handle; null when not running
```

**Key Functions**:
```js
function formatTimerDisplay(seconds)  // Returns "MM:SS" string
function startTimer()                 // Sets interval, ticks every 1000ms
function stopTimer()                  // Clears interval, retains remaining time
function resetTimer()                 // Clears interval, resets to 1500s, hides complete msg
function tickTimer()                  // Decrements timerSeconds; calls onTimerComplete if 0
function onTimerComplete()            // Stops timer, shows #timer-complete-msg
function updateTimerDisplay()         // Writes formatTimerDisplay(timerSeconds) to DOM
```

---

### 3. TodoList

**Responsibility**: Add, display, edit, complete, and delete tasks. Persist to `localStorage`.

**DOM Elements**:
- `#todo-input` — text input for new task
- `#todo-add-btn` — submit button
- `#todo-list` — `<ul>` container for task items

**Data Model**:
```js
// Task object
{
  id: string,        // crypto.randomUUID() or Date.now().toString()
  text: string,      // task description
  completed: boolean // completion state
}
```

**localStorage Key**: `"todo-life-tasks"`

**Key Functions**:
```js
function loadTasks()                  // Reads + parses localStorage, returns array
function saveTasks(tasks)             // JSON.stringify + localStorage.setItem
function renderTasks(tasks)           // Clears #todo-list, re-renders all task items
function createTaskElement(task)      // Returns <li> DOM node for a task
function addTask(text)                // Validates, creates task, saves, re-renders
function editTask(id, newText)        // Updates task text, saves, re-renders
function toggleTask(id)               // Flips completed boolean, saves, re-renders
function deleteTask(id)               // Removes task by id, saves, re-renders
```

**Task Item HTML Structure**:
```html
<li data-id="{id}" class="task-item [completed]">
  <button class="task-toggle">✓</button>
  <span class="task-text">{text}</span>
  <button class="task-edit">✎</button>
  <button class="task-delete">✕</button>
</li>
```

When editing, the `<span class="task-text">` is replaced inline with an `<input>` pre-filled with the current text. Confirming (Enter or blur) calls `editTask()`.

---

### 4. QuickLinks

**Responsibility**: Display, add, and delete quick-access link buttons. Persist to `localStorage`.

**DOM Elements**:
- `#link-label-input` — text input for link label
- `#link-url-input` — text input for link URL
- `#link-add-btn` — submit button
- `#links-container` — container for link buttons

**Data Model**:
```js
// Link object
{
  id: string,    // crypto.randomUUID() or Date.now().toString()
  label: string, // display label
  url: string    // target URL
}
```

**localStorage Key**: `"todo-life-links"`

**Key Functions**:
```js
function loadLinks()                  // Reads + parses localStorage, returns array
function saveLinks(links)             // JSON.stringify + localStorage.setItem
function renderLinks(links)           // Clears #links-container, re-renders all link buttons
function createLinkElement(link)      // Returns button+delete DOM node for a link
function addLink(label, url)          // Validates, creates link, saves, re-renders
function deleteLink(id)               // Removes link by id, saves, re-renders
```

**Link Item HTML Structure**:
```html
<div class="link-item" data-id="{id}">
  <a href="{url}" target="_blank" rel="noopener noreferrer">{label}</a>
  <button class="link-delete">✕</button>
</div>
```

---

## Data Models

### Task (localStorage: `"todo-life-tasks"`)

| Field       | Type    | Description                        |
|-------------|---------|------------------------------------|
| `id`        | string  | Unique identifier                  |
| `text`      | string  | Task description (non-empty)       |
| `completed` | boolean | Whether the task is done           |

Stored as a JSON array: `[{ id, text, completed }, ...]`

### Link (localStorage: `"todo-life-links"`)

| Field   | Type   | Description                        |
|---------|---------|------------------------------------|
| `id`    | string | Unique identifier                  |
| `label` | string | Display label (non-empty)          |
| `url`   | string | Target URL (non-empty)             |

Stored as a JSON array: `[{ id, label, url }, ...]`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting correctness for all hours

*For any* hour value in 0–23, `getGreeting(hour)` SHALL return exactly one of the four greeting strings ("Good Morning", "Good Afternoon", "Good Evening", "Good Night"), and the returned string SHALL match the hour range defined in Requirement 1.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 2: Timer display format invariant

*For any* integer value of remaining seconds in the range 0–1500, `formatTimerDisplay(seconds)` SHALL return a string matching the pattern `MM:SS` where MM is zero-padded minutes and SS is zero-padded seconds, and the total seconds represented SHALL equal the input value.

**Validates: Requirements 2.7**

---

### Property 3: Task addition round-trip

*For any* non-empty, non-whitespace task text string, after calling `addTask(text)`, the task collection read back from `localStorage` SHALL contain exactly one new entry whose `text` field equals the input string and whose `completed` field is `false`.

**Validates: Requirements 3.2, 6.1**

---

### Property 4: Whitespace task rejection

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), calling `addTask(text)` SHALL leave the task collection unchanged and SHALL NOT write a new entry to `localStorage`.

**Validates: Requirements 3.3**

---

### Property 5: Task persistence round-trip

*For any* task collection state (add, edit, toggle, delete operations in any order), calling `saveTasks(tasks)` followed by `loadTasks()` SHALL return a collection that is deeply equal to the saved collection.

**Validates: Requirements 6.1, 6.2**

---

### Property 6: Link persistence round-trip

*For any* link collection state, calling `saveLinks(links)` followed by `loadLinks()` SHALL return a collection that is deeply equal to the saved collection.

**Validates: Requirements 7.3, 8.2, 8.5**

---

### Property 7: Toggle idempotence (double-toggle)

*For any* task, toggling its completion state twice SHALL return the task to its original completion state.

**Validates: Requirements 5.2, 5.3**

---

### Property 8: Edit preserves identity

*For any* task and any non-empty replacement text, calling `editTask(id, newText)` SHALL update only the `text` field of the matching task; the `id` and `completed` fields SHALL remain unchanged.

**Validates: Requirements 4.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` contains malformed JSON | Wrap `JSON.parse` in `try/catch`; fall back to empty array `[]` |
| `localStorage` is unavailable (private mode, quota exceeded) | Catch `SecurityError` / `QuotaExceededError`; continue with in-memory state only |
| Task/link submitted with empty or whitespace-only input | Validate before mutation; retain focus on input field; do not modify state |
| Edit confirmed with empty value | Discard edit; restore original `<span>` with original text |
| Timer reaches 00:00 | Clear interval; show completion message; disable start button until reset |
| URL field submitted without protocol | Accept as-is (user responsibility); `target="_blank"` handles navigation |

---

## Testing Strategy

This feature is a client-side Vanilla JS application. The testing approach uses two complementary layers:

### Unit / Property Tests (Jest + fast-check)

Use **Jest** as the test runner and **fast-check** as the property-based testing library. Tests run in a jsdom environment (Jest default).

**Property test configuration**: Each property test runs a minimum of 100 iterations via fast-check's `fc.assert(fc.property(...))`.

**Tag format**: Each property test is annotated with a comment:
`// Feature: todo-life-dashboard, Property N: <property_text>`

**Targeted functions** (pure or near-pure, easy to unit-test):
- `getGreeting(hour)` — Property 1
- `formatTimerDisplay(seconds)` — Property 2
- `addTask` / `loadTasks` / `saveTasks` — Properties 3, 4, 5
- `saveLinks` / `loadLinks` — Property 6
- `toggleTask` — Property 7
- `editTask` — Property 8

**Example property test skeleton**:
```js
// Feature: todo-life-dashboard, Property 1: Greeting correctness for all hours
test('getGreeting returns correct greeting for all hours', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
      const result = getGreeting(hour);
      if (hour >= 5 && hour <= 11) return result === 'Good Morning';
      if (hour >= 12 && hour <= 17) return result === 'Good Afternoon';
      if (hour >= 18 && hour <= 20) return result === 'Good Evening';
      return result === 'Good Night'; // 21–23 and 0–4
    })
  );
});
```

### Integration / Smoke Tests

- Load `index.html` in a browser (or Playwright/Puppeteer) and verify:
  - All four widgets render without JS errors
  - `localStorage` keys are written after adding a task and a link
  - Timer starts, counts down, and stops at 00:00
  - Page reload restores tasks and links from `localStorage`

### Manual Checks

- Visual hierarchy and typography at default zoom
- Cross-browser smoke test in Chrome, Firefox, Edge, Safari
- Initial render time (DevTools Network throttle: Fast 3G)
