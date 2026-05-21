# Requirements Document

## Introduction

The Todo-Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a real-time greeting with the current date and time, a Pomodoro-style focus timer, a persistent to-do list, and a quick-access links panel — all in a single, minimal HTML/CSS/Vanilla JavaScript page. All data is stored in the browser's Local Storage with no backend required. The app can be used as a standalone web page or packaged as a browser extension.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a time-of-day greeting message.
- **Focus_Timer**: The UI section that implements a 25-minute countdown timer with start, stop, and reset controls.
- **Todo_List**: The UI section that manages a collection of user-defined tasks.
- **Task**: A single to-do item that has a text description and a completion state.
- **Quick_Links**: The UI section that displays user-defined shortcut buttons that open external URLs.
- **Link**: A single quick-access entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable release at the time of use.

---

## Requirements

### Requirement 1: Real-Time Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I am immediately oriented to the moment and feel welcomed.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 18 May 2026").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual indication that the session has ended.
7. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 3: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and a submit control for entering new task text.
2. WHEN the user submits a non-empty task text, THE Todo_List SHALL add a new Task with that text and a completion state of false.
3. IF the user submits an empty or whitespace-only input, THEN THE Todo_List SHALL not add a Task and SHALL retain focus on the input field.
4. THE Todo_List SHALL display all Tasks in the order they were added.
5. THE Todo_List SHALL visually distinguish completed Tasks from incomplete Tasks (e.g., strikethrough text or muted colour).

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit the text of an existing task, so that I can correct mistakes or update task descriptions.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an edit control for each Task.
2. WHEN the user activates the edit control for a Task, THE Todo_List SHALL replace the Task's text display with an editable input field pre-filled with the current task text.
3. WHEN the user confirms the edit with a non-empty value, THE Todo_List SHALL update the Task's text to the new value.
4. IF the user confirms the edit with an empty or whitespace-only value, THEN THE Todo_List SHALL discard the change and restore the original task text.

---

### Requirement 5: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can keep my list accurate and uncluttered.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a completion toggle control for each Task.
2. WHEN the user activates the completion toggle for an incomplete Task, THE Todo_List SHALL set that Task's completion state to true and apply a visual completed style.
3. WHEN the user activates the completion toggle for a completed Task, THE Todo_List SHALL set that Task's completion state to false and remove the completed style.
4. THE Todo_List SHALL provide a delete control for each Task.
5. WHEN the user activates the delete control for a Task, THE Todo_List SHALL permanently remove that Task from the list.

---

### Requirement 6: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN a Task is added, edited, completed, or deleted, THE Todo_List SHALL write the updated task collection to Local_Storage.
2. WHEN the Dashboard loads, THE Todo_List SHALL read the task collection from Local_Storage and render all previously saved Tasks.
3. IF no task data exists in Local_Storage, THEN THE Todo_List SHALL render an empty list with no errors.

---

### Requirement 7: Quick Links — Display and Open

**User Story:** As a user, I want to see my saved quick-access links as clickable buttons, so that I can navigate to my favourite websites with a single click.

#### Acceptance Criteria

1. THE Quick_Links SHALL display each saved Link as a labelled button.
2. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
3. WHEN the Dashboard loads, THE Quick_Links SHALL read the link collection from Local_Storage and render all previously saved Links.
4. IF no link data exists in Local_Storage, THEN THE Quick_Links SHALL render an empty state with no errors.

---

### Requirement 8: Quick Links — Add and Delete

**User Story:** As a user, I want to add and remove quick-access links, so that I can customise my shortcut panel to match my current needs.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide input fields for a link label and a link URL, and a submit control to add a new Link.
2. WHEN the user submits a non-empty label and a non-empty URL, THE Quick_Links SHALL add the new Link and save the updated collection to Local_Storage.
3. IF the user submits with an empty label or an empty URL, THEN THE Quick_Links SHALL not add the Link.
4. THE Quick_Links SHALL provide a delete control for each Link.
5. WHEN the user activates the delete control for a Link, THE Quick_Links SHALL permanently remove that Link and save the updated collection to Local_Storage.

---

### Requirement 9: Layout and Visual Design

**User Story:** As a user, I want a clean, readable, and visually organised interface, so that I can use the Dashboard comfortably without distraction.

#### Acceptance Criteria

1. THE Dashboard SHALL render all four widgets (Greeting_Widget, Focus_Timer, Todo_List, Quick_Links) within a single HTML page.
2. THE Dashboard SHALL apply styles exclusively from one CSS file located at `css/`.
3. THE Dashboard SHALL apply behaviour exclusively from one JavaScript file located at `js/`.
4. THE Dashboard SHALL use a clear visual hierarchy so that each widget is visually separated and identifiable.
5. THE Dashboard SHALL use typography that is legible at default browser zoom levels.

---

### Requirement 10: Browser Compatibility and Performance

**User Story:** As a user, I want the Dashboard to load quickly and work reliably in any modern browser, so that I can use it without compatibility issues or noticeable lag.

#### Acceptance Criteria

1. THE Dashboard SHALL function correctly in Modern_Browser environments without requiring any plugins or extensions beyond a standard browser.
2. THE Dashboard SHALL complete initial render within 2 seconds on a standard desktop connection.
3. WHEN the user interacts with any control (add, edit, delete, toggle, timer), THE Dashboard SHALL reflect the change in the UI within 100 milliseconds.
4. THE Dashboard SHALL require no backend server and SHALL operate entirely from static files.
