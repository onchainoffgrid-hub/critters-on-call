# Critters on Call × Durbin Crossing — prize wheel

**Event date:** Sunday, September 27, 2026 · 10 AM – 1 PM  
**Location:** Durbin Crossing · 145 South Durbin Parkway, St Johns, FL 32259  
**Animal pickup:** 8:45 AM · Kate Smith / Vesta CDD  
**Event ID:** `durbin-crossing-2026-09-27`  
**Expires:** **2026-09-29 00:00:00 America/New_York** (end of Mon Sep 28 night) — page stays live; wheel non-functional with “Event ended”  
**Brand:** Forest `#4C6458` (Homestead Logo Circle / wife chicken logo), deep `#3A4F45`, sage `#5A7366`, gold `#c9a227`. Hub = Critters on Call text. See `BRANDING.md`.

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
- **After unlock succeeds:** optional “Love it? Leave a Google review” → `https://g.page/r/CS74JMTm3xrWEAE/review`
- **One claim** per email **and** per phone for this `event_id` (when contact saved)
- **Spin again** does not consume a claim; still counts toward max 3 spins
- **Gold cap:** max **5** Gold membership awards this event (`localStorage` `coc_dc_gold_awards_v1_<EVENT_ID>`). Claim form increments; staff `admin.html` **+1 Gold claimed** for Text GOAT / physical statues. At 5, Gold weight → 0 and any Gold landing converts to $10 thrift. Copy: “only 5 gold statues at this event.”
- Leads: `localStorage` → staff `admin.html` CSV / mailto stub (PIN `0927`)

## Wheel (8 segments) · weights sum 100%

| # | Prize | Weight | Notes |
|---|--------|--------|------|
| 0 | $10 thrift gift | **43%** | Majority land here · `DC10T-*` |
| 1 | $10 farm gift | 6% | `DC10F-*` |
| 2 | $25 thrift gift | **16%** | `DC25T-*` |
| 3 | $25 farm gift | 5% | `DC25F-*` |
| 4 | Free $25 ticket | 8% | Do not name what for |
| 5 | Free $50 ticket | 5% | |
| 6 | Gold membership | 5% | Hard-capped at **5 awards** |
| 7 | Spin again | 12% | No claim used |

Farm gifts combined ~11%. Labels use two-line shorts + `.dc-wheel .wheel-label span { top: 0.32rem; width: 2.85rem }` so text stays inside each wedge.

## Files

- `index.html` — wheel + unlock CTAs + optional lead store + expiry  
- `admin.html` — CSV export + Gold 0–5 counter  
- `hen-mark-gold.png` — hen mark (header/favicon only)  
- `qr/` — print QRs  
- `OUTLINE.md` — CRM warming  
- `QR-STICKERS.md` — 12 goat URLs  
- `BRANDING.md` — greens + logo flag  
- `FAILED_LOOKUP.txt` — $6.99 product URL not found  

## Deploy

```bash
cd /workspace/critters-on-call
git add events/durbin-crossing-2026-09-27
git commit -m "Durbin Crossing wheel: labels, weights, gold cap 5, expiry Sep 28"
git push origin main
```

Live path must remain `/events/durbin-crossing-2026-09-27/` so goat stickers keep working.
