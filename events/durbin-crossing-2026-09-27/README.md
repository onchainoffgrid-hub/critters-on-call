# Critters on Call × Durbin Crossing — prize wheel

**Event date:** Sunday, September 27, 2026 (caller said “tomorrow” on Sat Sep 26 2026 ET)  
**Event ID:** `durbin-crossing-2026-09-27`  
**Brand:** Event-only co-mark — Critters gold + Durbin Crossing CDD accent approx. `#562f2f` (public site). No scraped logos.

## Live URL (after git push to main)

https://onchainoffgrid-hub.github.io/critters-on-call/events/durbin-crossing-2026-09-27/

Goat variants: `?goat=01` … `?goat=12` — see `QR-STICKERS.md`.

## Local

```bash
cd /workspace/critters-on-call && python3 -m http.server 8766
```

http://localhost:8766/events/durbin-crossing-2026-09-27/

## Rules (client-side)

- Max **3 spins** per device (event-scoped localStorage)
- Email + phone required to **unlock/reveal** prize
- **One unlock forever** per email **and** per phone for this `event_id`
- Leads: `localStorage` → staff `admin.html` CSV / mailto stub (PIN `0927`)

## Wheel (8 segments)

| # | Prize | Notes |
|---|--------|------|
| 0 | $10 Visit Us gift | Opposite $25 |
| 1 | Mommy & Me seat | $0 fulfill |
| 2 | Free membership + Golden Goat | PREMIUM |
| 3 | Farm tour car pass | $0 fulfill |
| 4 | $25 Visit Us gift | Opposite $10 |
| 5 | Goat yoga seat | $0 fulfill |
| 6 | Sticker pack claim | $0 fulfill |
| 7 | High-five from a goat | Joke + FB CTA |

## Files

- `index.html` — wheel + gate + lead store  
- `admin.html` — CSV export  
- `OUTLINE.md` — CRM warming + mom-app (VPK/ELC/Step Up/PEP)  
- `QR-STICKERS.md` — 12 goat URLs  

## Deploy

Repo already has GitHub Pages (`main` `/`):

```bash
cd /workspace/critters-on-call
git add events/durbin-crossing-2026-09-27
git commit -m "Durbin Crossing 2026-09-27 event prize wheel v1"
git push origin main
```

Wait ~1 min for Pages build, then open live URL + print QRs.
