# Critters on Call × Durbin Crossing — prize wheel

**Event date:** Sunday, September 27, 2026  
**Event ID:** `durbin-crossing-2026-09-27`  
**Brand:** Gold-card / membership aesthetic — forest `#2F4F3E`, sage `#4F6559`, gold `#c9a227`. See `BRANDING.md`.

## Live URL (MUST stay exact)

https://onchainoffgrid-hub.github.io/critters-on-call/events/durbin-crossing-2026-09-27/

Goat variants: `?goat=01` … `?goat=12` — see `QR-STICKERS.md`.

## Local

```bash
cd /workspace/critters-on-call && python3 -m http.server 8766
```

http://localhost:8766/events/durbin-crossing-2026-09-27/

## Rules (client-side)

- Max **3 spins** per device (event-scoped localStorage)
- Prize shown when wheel stops (no blur gate)
- **Primary unlock:** Text GOAT to 914 (`sms:9142631311?body=GOAT`) or Email us (`mailto:sheehanhomestead@gmail.com`)
- Optional email + phone for staff lead store
- **One claim** per email **and** per phone for this `event_id` (when contact saved)
- **Spin again** does not consume a claim; still counts toward max 3 spins
- Leads: `localStorage` → staff `admin.html` CSV / mailto stub (PIN `0927`)

## Wheel (8 segments)

| # | Prize | Notes |
|---|--------|------|
| 0 | $10 thrift gift | Code `DC10T-*` |
| 1 | $10 farm gift | Code `DC10F-*` |
| 2 | $25 thrift gift | Code `DC25T-*` |
| 3 | $25 farm gift | Code `DC25F-*` |
| 4 | Free $25 ticket | Do not name what for |
| 5 | Free $50 ticket | |
| 6 | Gold membership | PREMIUM |
| 7 | Spin again | Chosen over 2nd gold — on-brand, keeps wheel fun |

## Files

- `index.html` — wheel + unlock CTAs + optional lead store  
- `admin.html` — CSV export (uses `prize_label` from leads)  
- `hen-mark-gold.png` — hen mark (source monochrome/gold)  
- `qr/` — print QRs (wheel, services, mobile-699 fallback)  
- `OUTLINE.md` — CRM warming  
- `QR-STICKERS.md` — 12 goat URLs  
- `BRANDING.md` — greens + logo flag  
- `FAILED_LOOKUP.txt` — $6.99 product URL not found  

## Deploy

```bash
cd /workspace/critters-on-call
git add events/durbin-crossing-2026-09-27
git commit -m "Durbin Crossing wheel v2: gold-card prizes + SMS unlock"
git push origin main
```

Live path must remain `/events/durbin-crossing-2026-09-27/` so goat stickers keep working.
