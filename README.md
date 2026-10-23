# NEXORA

An install-free, deterministic civic logistics prototype for coordinating community resource pickup and delivery.

## Start on Windows

Requires Node.js 18 or newer. No package installation is needed.

```powershell
cd 'C:\Users\ASUS\OneDrive\Desktop\.0'
node .\server.mjs
```

Open [http://localhost:4173](http://localhost:4173). Keep the terminal running while using the app. Press `Ctrl+C` to stop the local server.

## Explore the prototype

- Use the role switcher to explore Operator, Donor, Rider, and Shelter workspaces.
- On **Dispatch board**, inspect rider and shelter eligibility explanations, then offer a full or split assignment.
- On **Operations map**, pan and zoom the interactive map, filter markers, highlight a batch, inspect popups, and start or pause deterministic rider movement. Choose an operational scenario to update the shared demo records.
- On **Rescue mode**, trigger breakdown or missed check-in, compare ranked replacements, and confirm a reassignment. The no-safe-option case blocks reassignment and records an escalation.
- Use the simulation reset controls to restore the deterministic starting data.

## Map and data notes

When the browser can reach the public tile service, the map uses Leaflet with OpenStreetMap tiles and attribution. Leaflet loads from a public CDN. If it is unavailable, the app provides an interactive offline schematic with pan, zoom, filters, markers, and routes. If map tiles fail while Leaflet is available, the map and controls remain interactive and the provider status reports the tile problem.

All locations, assignments, rider movement, ETA calculations, traffic/delay scenarios, events, and analytics are simulated. The app does not receive GPS, live traffic, or connected routing data. Operational demo data is stored in this browser's local storage; it is not a multi-user backend or real authentication system.
