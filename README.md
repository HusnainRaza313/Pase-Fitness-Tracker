PACE — Fitness Tracker

A simple, clean fitness tracking web app built with vanilla HTML, CSS, and JavaScript. Log daily workouts, steps, and calories, and see your progress on a dashboard with stopwatch-style progress rings and a weekly chart.

Built for CodeAlpha Task 3: Fitness Tracker App.


Features


Daily dashboard — three progress rings show today's steps, calories burned, and active minutes against your goals
Manual activity logging — add entries with activity type (Walking, Running, Cycling, Strength, Swimming, Other), duration, steps, and calories
Editable goals — set your own daily targets for steps, calories, and active minutes
Weekly progress chart — combined bar + line chart of steps and calories over the last 7 days
Activity log — all entries grouped by day, with the ability to delete any entry
Streak tracker — counts consecutive days with at least one logged activity
Persistent storage — all data is saved in the browser's localStorage, so it's still there when you come back
Responsive design — works on desktop and mobile screens


Tech Stack

LayerTechnologyStructureHTML5StylingCSS3 (custom properties, Flexbox)LogicVanilla JavaScript (ES6+)StorageBrowser localStorageFontsGoogle Fonts (Bebas Neue, Inter, JetBrains Mono)

No frameworks, build tools, or external JS libraries are required — everything runs directly in the browser.

Project Structure

pace-fitness-tracker/
├── index.html      # App structure and layout
├── style.css        # All styling (theme, layout, components)
├── script.js         # App logic: state, rendering, events, localStorage
└── README.md        # This file

Getting Started

No installation or build step needed.


Download or clone this repository
Open index.html directly in any modern browser (Chrome, Firefox, Edge, Safari)


Or, for a local dev server (optional, avoids any browser file-access quirks):

bash# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .

Then visit http://localhost:8000.

How It Works


On first load, the app seeds itself with one week of sample activity data so the dashboard isn't empty. This is stored in localStorage under the key pace_entries.
Default goals (10,000 steps / 500 kcal / 45 active minutes) are stored under pace_goals.
Adding, editing goals, or deleting an entry updates localStorage immediately, so your data persists across page reloads and browser sessions on the same device.
To reset the app to a clean state, clear the site's local storage from your browser's developer tools (Application → Local Storage) or clear browsing data for the page.


Possible Future Enhancements


Sync data across devices with a backend (Firebase / a REST API + database)
User accounts and authentication
Export activity history to CSV
Import step/heart-rate data from wearables or health APIs
Monthly/yearly trend views


Author

Husni — Computer Science student, Bahria University Lahore
Submitted as part of the CodeAlpha App Development Internship.
