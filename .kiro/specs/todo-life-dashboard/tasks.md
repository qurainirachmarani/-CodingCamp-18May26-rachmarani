# Implementation Plan: Todo-Life Dashboard

## Overview

Implement the Todo-Life Dashboard as three static files (`index.html`, `css/style.css`, `js/app.js`) using plain HTML, CSS, and Vanilla JavaScript. Tasks are ordered so each step builds on the previous one, with testing sub-tasks placed close to the code they verify. The Jest + fast-check test suite targets the pure logic functions exported from `js/app.js`.

## Tasks

- [x] 1. Set up project structure and HTML scaffold
  - Create `index.html` at the project root with the full page structure: `<head>` linking `css/style.css`, four widget sections (`#greeting-widget`, `#focus-timer`, `#todo-list-widget`, `#quick-links-widget`), and a deferred `<script src="js/app.js">` tag
  - Create empty `css/style.css` and `js/app.js` files
  - Add `package.json` with Jest and fast-check as dev dependencies (`jest`, `@jest/globals`, `fast-check`, `jest-environment-jsdom`)
  - Add `jest.config.js` configured for `jsdom` test environment
  - _Requirements: 9.1, 9.2, 9.3, 10.4_

- [ ] 2. Implement Greeting Widget
  - [x] 2.1 Implement greeting logic functions in `js/app.js`
    - Write `getGreeting(hour)` — returns "Good Morning" (5–11), "Good Afternoon" (12–17), "Good Evening" (18–20), "Good Night" (21–4)
    - Write `formatTime(date)` — returns zero-padded "HH:MM" string
    - Write `formatDate(date)` — returns "Weekday, DD Month YYYY" string
    - Write `updateGreetingWidget()` — reads `new Date()`, updates `#greeting-text`, `#current-time`, `#current-date`
    - Call `updateGreetingWidget()` on page load and schedule `setInterval(updateGreetingWidget, 60000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for greeting correctness (Property 1)
    - **Property 1: Greeting correctness for all hours**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Use `fc.integer({ min: 0, max: 23 })` to generate all possible hours; assert `getGreeting(hour)` returns the correct string for each range
    - `// Feature: todo-life-dashboard, Property 1: Greeting correctness for all hours`

  - [ ]* 2.3 Write property test for time format (Property 2 — partial)
    - Verify `formatTime(date)` always returns a string matching `/^\d{2}:\d{2}$/` for any valid Date
    - `// Feature: todo-life-dashboard, Property 2: Timer display format invariant (formatTime)`

- [x] 3. Implement Focus Timer
  - [x] 3.1 Implement Focus Timer state and functions in `js/app.js`
    - Declare `let timerSeconds = 1500` and `let timerInterval = null`
    - Write `formatTimerDisplay(seconds)` — returns zero-padded "MM:SS" string
    - Write `updateTimerDisplay()` — writes `formatTimerDisplay(timerSeconds)` to `#timer-display`
    - Write `tickTimer()` — decrements `timerSeconds`, calls `updateTimerDisplay()`, calls `onTimerComplete()` when `timerSeconds === 0`
    - Write `startTimer()` — guards against double-start, sets `timerInterval = setInterval(tickTimer, 1000)`
    - Write `stopTimer()` — calls `clearInterval(timerInterval)`, sets `timerInterval = null`
    - Write `resetTimer()` — calls `stopTimer()`, resets `timerSeconds = 1500`, hides `#timer-complete-msg`, calls `updateTimerDisplay()`
    - Write `onTimerComplete()` — calls `stopTimer()`, shows `#timer-complete-msg`
    - Wire start/stop/reset button click handlers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 3.2 Write property test for timer display format (Property 2)
    - **Property 2: Timer display format invariant**
    - **Validates: Requirements 2.7**
    - Use `fc.integer({ min: 0, max: 1500 })` to generate seconds; assert `formatTimerDisplay(s)` matches `/^\d{2}:\d{2}$/` and that `Math.floor(s/60)` and `s%60` match the MM and SS parts
    - `// Feature: todo-life-dashboard, Property 2: Timer display format invariant`

  - [ ]* 3.3 Write unit tests for timer state transitions
    - Test: `resetTimer()` sets `timerSeconds` to 1500
    - Test: `tickTimer()` at `timerSeconds === 1` triggers `onTimerComplete()`
    - Test: `startTimer()` called twice does not create two intervals
    - _Requirements: 2.1, 2.5, 2.6_

- [ ] 4. Checkpoint — Ensure greeting and timer tests pass
  - Run `npx jest --testPathPattern="greeting|timer" --run` (or equivalent)
  - Ensure all tests pass; ask the user if questions arise.

- [ ] 5. Implement Todo List — core data functions
  - [ ] 5.1 Implement task data functions in `js/app.js`
    - Write `loadTasks()` — reads `"todo-life-tasks"` from `localStorage`, wraps `JSON.parse` in `try/catch`, returns `[]` on error or missing key
    - Write `saveTasks(tasks)` — serialises array to JSON and calls `localStorage.setItem`, wraps in `try/catch`
    - Initialise `let tasks = loadTasks()` on page load
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 5.2 Write property test for task persistence round-trip (Property 5)
    - **Property 5: Task persistence round-trip**
    - **Validates: Requirements 6.1, 6.2**
    - Use `fc.array(fc.record({ id: fc.string(), text: fc.string({ minLength: 1 }), completed: fc.boolean() }))` to generate task arrays; assert `loadTasks()` after `saveTasks(tasks)` returns a deeply equal array
    - Mock `localStorage` with a simple in-memory object
    - `// Feature: todo-life-dashboard, Property 5: Task persistence round-trip`

  - [ ]* 5.3 Write edge-case test for missing localStorage data
    - Clear `localStorage`, call `loadTasks()`, verify it returns `[]` without throwing
    - _Requirements: 6.3_

- [ ] 6. Implement Todo List — add, render, and validate
  - [ ] 6.1 Implement `addTask` and `renderTasks` in `js/app.js`
    - Write `createTaskElement(task)` — returns an `<li>` with `data-id`, toggle button, text span, edit button, delete button; adds `"completed"` class when `task.completed` is true
    - Write `renderTasks(tasks)` — clears `#todo-list`, appends a `createTaskElement` for each task
    - Write `addTask(text)` — trims input; if empty/whitespace, retains focus on `#todo-input` and returns; otherwise creates `{ id: crypto.randomUUID(), text, completed: false }`, pushes to `tasks`, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`, clears `#todo-input`
    - Wire `#todo-add-btn` click and `#todo-input` keydown (Enter) to `addTask`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Write property test for task addition round-trip (Property 3)
    - **Property 3: Task addition round-trip**
    - **Validates: Requirements 3.2, 6.1**
    - Use `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` to generate valid task texts; assert that after `addTask(text)` the `tasks` array contains exactly one new entry with matching `text` and `completed: false`, and `localStorage` reflects the change
    - `// Feature: todo-life-dashboard, Property 3: Task addition round-trip`

  - [ ]* 6.3 Write property test for whitespace task rejection (Property 4)
    - **Property 4: Whitespace task rejection**
    - **Validates: Requirements 3.3**
    - Use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` to generate whitespace-only strings; assert that `addTask(text)` leaves the `tasks` array unchanged
    - `// Feature: todo-life-dashboard, Property 4: Whitespace task rejection`

- [ ] 7. Implement Todo List — edit, toggle, and delete
  - [ ] 7.1 Implement `editTask`, `toggleTask`, and `deleteTask` in `js/app.js`
    - Write `editTask(id, newText)` — if `newText.trim()` is empty, restore original text; otherwise update `task.text`, call `saveTasks(tasks)`, call `renderTasks(tasks)`
    - Write `toggleTask(id)` — flips `task.completed`, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`
    - Write `deleteTask(id)` — filters out task by id, calls `saveTasks(tasks)`, calls `renderTasks(tasks)`
    - Wire edit button click to inline edit mode: replace `<span>` with `<input>` pre-filled with current text; confirm on Enter or blur
    - Wire toggle button click to `toggleTask`
    - Wire delete button click to `deleteTask`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property test for toggle idempotence (Property 7)
    - **Property 7: Toggle idempotence (double-toggle)**
    - **Validates: Requirements 5.2, 5.3**
    - Use `fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1 }), completed: fc.boolean() })` to generate tasks; assert that calling `toggleTask(id)` twice returns the task to its original `completed` state
    - `// Feature: todo-life-dashboard, Property 7: Toggle idempotence (double-toggle)`

  - [ ]* 7.3 Write property test for edit preserves identity (Property 8)
    - **Property 8: Edit preserves identity**
    - **Validates: Requirements 4.3**
    - Generate a task and a non-empty replacement text; assert that after `editTask(id, newText)` only `text` changes — `id` and `completed` remain identical
    - `// Feature: todo-life-dashboard, Property 8: Edit preserves identity`

  - [ ]* 7.4 Write edge-case tests for edit validation
    - Call `editTask(id, "")` and `editTask(id, "   ")` — verify original text is preserved
    - _Requirements: 4.4_

- [ ] 8. Checkpoint — Ensure all Todo List tests pass
  - Run `npx jest --testPathPattern="todo" --run` (or equivalent)
  - Ensure all tests pass; ask the user if questions arise.

- [ ] 9. Implement Quick Links — core data functions
  - [ ] 9.1 Implement link data functions in `js/app.js`
    - Write `loadLinks()` — reads `"todo-life-links"` from `localStorage`, wraps `JSON.parse` in `try/catch`, returns `[]` on error or missing key
    - Write `saveLinks(links)` — serialises array to JSON and calls `localStorage.setItem`, wraps in `try/catch`
    - Initialise `let links = loadLinks()` on page load
    - _Requirements: 7.3, 7.4_

  - [ ]* 9.2 Write property test for link persistence round-trip (Property 6)
    - **Property 6: Link persistence round-trip**
    - **Validates: Requirements 7.3, 8.2, 8.5**
    - Use `fc.array(fc.record({ id: fc.string(), label: fc.string({ minLength: 1 }), url: fc.string({ minLength: 1 }) }))` to generate link arrays; assert `loadLinks()` after `saveLinks(links)` returns a deeply equal array
    - `// Feature: todo-life-dashboard, Property 6: Link persistence round-trip`

- [ ] 10. Implement Quick Links — add, render, and delete
  - [ ] 10.1 Implement `addLink`, `deleteLink`, and `renderLinks` in `js/app.js`
    - Write `createLinkElement(link)` — returns a `<div class="link-item">` containing an `<a href="{url}" target="_blank" rel="noopener noreferrer">{label}</a>` and a delete button
    - Write `renderLinks(links)` — clears `#links-container`, appends a `createLinkElement` for each link
    - Write `addLink(label, url)` — trims both inputs; if either is empty/whitespace, returns without adding; otherwise creates `{ id: crypto.randomUUID(), label, url }`, pushes to `links`, calls `saveLinks(links)`, calls `renderLinks(links)`, clears both input fields
    - Write `deleteLink(id)` — filters out link by id, calls `saveLinks(links)`, calls `renderLinks(links)`
    - Wire `#link-add-btn` click to `addLink`
    - Wire delete button click to `deleteLink`
    - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 10.2 Write unit tests for link add validation
    - Test: `addLink("", "https://example.com")` does not add a link
    - Test: `addLink("Example", "")` does not add a link
    - Test: `addLink("  ", "https://example.com")` does not add a link
    - _Requirements: 8.3_

  - [ ]* 10.3 Write unit test for link open behavior
    - Render a link element, verify the `<a>` has `target="_blank"` and `rel="noopener noreferrer"` and `href` matches the stored URL
    - _Requirements: 7.2_

- [ ] 11. Apply CSS styles in `css/style.css`
  - Add CSS custom properties (variables) for colour palette, spacing, and typography
  - Style the page layout: CSS Grid or Flexbox to arrange the four widgets in a clear visual hierarchy
  - Style each widget with a card-like container (background, border-radius, padding, shadow)
  - Style the Greeting Widget: large time display, readable date, prominent greeting text
  - Style the Focus Timer: large MM:SS display, clearly labelled start/stop/reset buttons, hidden `#timer-complete-msg` (shown via `.visible` class)
  - Style the Todo List: input row, task items with toggle/edit/delete controls, `.completed` class applies strikethrough and muted colour
  - Style the Quick Links: input row, link buttons in a wrapping flex row, delete button per link
  - Ensure legible typography at default browser zoom (minimum 16px base font size)
  - _Requirements: 9.2, 9.4, 9.5, 3.5, 5.2_

- [ ] 12. Wire everything together and validate page load behaviour
  - [ ] 12.1 Ensure `js/app.js` initialises all widgets on `DOMContentLoaded`
    - Wrap all initialisation calls in a `DOMContentLoaded` event listener (or place `<script>` as deferred)
    - Call `updateGreetingWidget()` and start the minute interval
    - Call `updateTimerDisplay()` to show 25:00 on load
    - Call `renderTasks(tasks)` to restore saved tasks
    - Call `renderLinks(links)` to restore saved links
    - _Requirements: 1.1, 2.1, 6.2, 7.3_

  - [ ]* 12.2 Write smoke tests for page initialisation
    - Verify `#greeting-text`, `#current-time`, `#current-date` are non-empty after `updateGreetingWidget()`
    - Verify `#timer-display` shows "25:00" on init
    - Verify `loadTasks()` and `loadLinks()` return arrays (not throw) when `localStorage` is empty
    - _Requirements: 1.1, 2.1, 6.3, 7.4_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Run the full test suite: `npx jest --run` (or equivalent)
  - Ensure all tests pass; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 4, 8, 13) ensure incremental validation
- Property tests use **fast-check** with a minimum of 100 iterations per property
- Unit tests cover specific examples, edge cases, and DOM structure checks
- All `localStorage` interactions should be wrapped in `try/catch` to handle private browsing and quota errors
- `crypto.randomUUID()` is available in all modern browsers; fall back to `Date.now().toString() + Math.random()` if needed

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "3"] },
    { "wave": 3, "tasks": ["4"] },
    { "wave": 4, "tasks": ["5", "6", "7"] },
    { "wave": 5, "tasks": ["8"] },
    { "wave": 6, "tasks": ["9", "10", "11"] },
    { "wave": 7, "tasks": ["12"] },
    { "wave": 8, "tasks": ["13"] }
  ]
}
```
