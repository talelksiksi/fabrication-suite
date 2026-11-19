# Fabrication Shop Suite (demo)

Interactive demo of an order, drawing, production and client-tracking system for
stainless steel workshops that build commercial kitchens, food production units,
mall kiosks and event stands. Served at
https://cictnardc.net/portfolio/fabrication-suite/. English, French and Arabic.

| Screen | File | What it does |
| --- | --- | --- |
| Demo page | `index.html` | Every screen side by side, simulated busy workshop |
| Office | `office.html` | Orders with progress, quotes, drawings and revisions, payments, production board, stock |
| Workshop tablet | `workshop.html?station=welding` | One station at a time: approved drawing, start, done, QC pass or rework |
| Client tracking | `track.html?o=<token>` | Private link per order: progress per article, drawing approval, milestones, payments |
| Public website | `site.html` | The fabricator's site: services, projects, clients, quote request (lands in the office's quotes) |

## Model

An order holds articles. Each article follows a route through the stations
(cutting, bending, welding, polishing, assembly, quality check, packing, site
installation), keeps its history, and carries its drawings with revisions. A new
revision goes to the client; articles not yet cut wait for the approval, pieces
already cut keep the approved revision. Material is reserved when a quote becomes
an order and consumed when cutting is done.

Drawings in the demo are SVG plans and elevations drawn from each article's
dimensions; in the real system they are the PDF exported next to each .dwg file.

## How it runs

Plain HTML, CSS and JavaScript, no build step. Shared state in localStorage, pushed
to other tabs and frames through a BroadcastChannel (`js/store.js`). The real
system keeps the same shape on a server (ASP.NET Core, PostgreSQL) and pushes the
same changes over SignalR.

The fabricator, clients and projects are invented. `vendor/qrcode.js` is
qrcode-generator by Kazuhiko Arase (MIT).
