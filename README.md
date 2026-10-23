# RESWAY

**Resources, routed right.** RESWAY coordinates time-sensitive donations, rider delivery, and shelter receiving. The included dataset is deterministic simulated demo data; it does not connect to GPS, live traffic, or real aid services.

## Install and start on Windows

Requires Node.js 20 or newer.

```powershell
cd 'C:\Users\ASUS\OneDrive\Desktop\RESWAY'
npm install
npm run db:seed
npm run dev
```

Open http://localhost:4173. Use `npm start` for a non-watch server. Press Ctrl+C to stop it. SQLite is created automatically at `data/resway.sqlite3`; set `RESWAY_DB` to choose another database path. `npm run db:reset` restores the deterministic seed and demo accounts.

## Demo accounts

All seeded accounts use password `resway-demo-2026`.

- `operator@resway.demo` — network operations, dispatch, map, scenarios, Rescue Mode, analytics, and audit
- `donor@resway.demo` — donor workspace and owned resource batches
- `rider@resway.demo` — Jordan Lee's rider tasks, delivery, profile, and safety workflows
- `shelter@resway.demo` — Northside Shelter demand, incoming aid, and receipt confirmation

The login page also has one-click Demo Mode buttons for each role. New accounts can be created with `/join`.

## Features

The original operations map, offline schematic, simulated routes, movement controls, Rescue Mode, seven scenarios, role workspaces, audit log, and responsive layout remain in the app. Browser operations load from and save to the SQLite database through the API; the browser does not store the operational dataset as its database. Authentication uses bcrypt password hashes and an HttpOnly session cookie. The demo route and ETA calculations are deterministic and are not live traffic.

## API

All `/api` routes except `/api/health` and `/api/auth/login`, `/api/auth/signup` require a session cookie. Authentication endpoints include login, signup, logout, and `/auth/me`. Operational routes cover batches (including split), riders, shelters and receipt, assignments and reassignment, incidents, simulation state/scenarios, analytics, and audit events. Role ownership checks are applied to API mutations.

## Validation

Run `npm test` for the API integration suite. The tests cover login, authorization, state persistence, dispatch ranking, split quantities, scenario mutations, and simulation reset.
