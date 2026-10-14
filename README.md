# Bloom — Menstrual Cycle Calendar

A student-scale, responsive Vue 3 single-page application inspired by the general product patterns of Flo Health. This is an original student project and is not affiliated with Flo Health. It does not copy Flo's branding or proprietary assets.

## Tech stack
- Vue 3 + Vite
- Vue Router (lazy-loaded routes)
- Pinia for state management
- Lucide Vue icons
- CSS custom properties and responsive design
- Browser `localStorage` for demo persistence
- Vitest for unit testing
- Playwright for end-to-end testing

## Run locally

Requires Node.js 20 or newer (Node 22+ recommended).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Testing

### Unit tests (Vitest)

```bash
npm test
```

Unit tests cover:
- Date arithmetic (`dateKey`, `addDays`, `daysBetween`, `periodDuration`)
- Calendar grid generation (leap-year handling, month boundaries)
- Cycle-day and phase calculations
- Next-period prediction logic
- Profile/settings validation and clamping
- Period record and log entry validation
- Store CRUD operations (create, read, update, delete)
- LocalStorage persistence and reload
- Malformed data recovery
- Router configuration and route resolution

### End-to-end tests (Playwright)

```bash
npx playwright install chromium
npm run test:e2e
```

E2E tests exercise the full application through a headless Chromium browser:
- All six routes render without errors
- Period CRUD (create, edit, delete)
- Period date validation (rejects invalid ranges)
- Daily log CRUD (create, edit, delete)
- Log search and mood filtering
- Calendar month navigation and date selection
- Settings save, persist-on-reload, and reset
- Data export produces a JSON file
- Learning library search and filtering
- No console errors on any page
- Responsive behavior at 320/375/430/768/1024/1366/1920 px
- Mobile sidebar drawer open/close
- Modals stay within viewport on mobile

## Features
- **Dashboard**: Next-period estimate, cycle-day summary, phase label, recent check-ins, quick actions
- **Calendar**: Interactive month view with previous/next navigation, date selection, period/prediction/ovulation highlighting, and a legend
- **Period CRUD**: Add, edit, and delete period records with date-range validation and overlap prevention (with confirmation dialogs)
- **Daily log**: Mood, flow, energy, symptom, and notes tracking with edit-from-history
- **Insights**: Average cycle length, cycle intervals, most-logged symptoms (CSS-based charts from real store data)
- **Learning library**: Educational articles with search and category filtering
- **Settings**: Profile name, cycle/period lengths, reminder preferences, data export, and demo reset
- **Responsive**: Mobile drawer navigation, adaptive layouts, and accessible controls
- **Persistence**: All data saved to `localStorage` and restored on reload

## Important limitations
- This is an educational prototype, not a medical device.
- Cycle predictions are estimates based on the user's settings and recorded period starts. They cannot guarantee period or ovulation dates and should not be used as contraception.
- Browser notifications are not implemented; reminder preferences are saved in-app only.
- This app intentionally has no account or sign-in gate. LocalStorage is not encrypted, and there is no cloud sync or secure multi-user authentication. Do not enter sensitive personal information on a shared device.
- Health education is general and not a substitute for a qualified healthcare professional.
- Automated browser tests run against a local Vite dev server. See `e2e/` for the test suite.

## Data storage

All data is stored in `localStorage` under the key `bloom-cycle-care-v1` in the current browser. Data includes:
- `profile`: user preferences (name, cycle length, period length, reminder settings)
- `periods`: array of period records (`{ id, start, end, notes }`)
- `logs`: array of daily check-in records (`{ id, date, mood, flow, energy, symptoms, notes }`)
- `createdAt`: the date the data was first seeded

## Project structure

```text
menstrual-cycle-calendar-capstone/
├── public/
│   └── bloom-mark.svg
├── src/
│   ├── assets/
│   │   └── bloom-illustration.svg
│   ├── components/
│   │   ├── AppSidebar.vue
│   │   ├── AppTopbar.vue
│   │   ├── CalendarGrid.vue
│   │   ├── StatCard.vue
│   │   ├── SymptomForm.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── EmptyState.vue
│   │   └── LoadingState.vue
│   ├── data/
│   │   └── articles.js
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   └── cycle.js
│   ├── utils/
│   │   ├── cycle.js
│   │   └── validation.js
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── CalendarView.vue
│   │   ├── LogView.vue
│   │   ├── InsightsView.vue
│   │   ├── LearnView.vue
│   │   └── SettingsView.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── e2e/
│   ├── workflow.spec.js
│   └── responsive.spec.js
├── src/
│   ├── utils/cycle.test.js
│   ├── utils/validation.test.js
│   ├── stores/cycle.test.js
│   └── router/index.test.js
├── index.html
├── package.json
├── vitest.config.js
├── playwright.config.js
├── vite.config.js
├── .gitignore
└── README.md
```

## Calculation notes

- **Cycle day**: Calculated as `days since last period start mod cycle length + 1`. Day 1 is the first day of bleeding.
- **Phase estimation**: Uses cycle day and configured period length to label phases (Menstrual, Follicular, Around ovulation, Luteal). These are estimates only.
- **Ovulation estimate**: Calculated as 14 days before the predicted next period. This is a calendar estimate, not medical confirmation.
- **Average cycle**: Computed from recorded period-start intervals, filtering out intervals outside 15–60 days as likely data errors. Falls back to the configured cycle length when fewer than two starts are recorded.
- **Period duration**: Inclusive day count (start to end = end - start + 1 days).

## Suggested submission checklist
1. Run `npm install` and `npm run dev`.
2. Test calendar navigation, logging, edit/delete, settings, and persistence after refresh.
3. Run `npm run build` and resolve any environment-specific issue.
4. Run `npm test` for unit tests and `npm run test:e2e` for browser tests.
5. The app opens directly to the dashboard; no account setup is required. Add your name, section, instructor, and screenshots to your submission package if required by your school.
6. Include this README and explain that data is stored locally in the browser.
