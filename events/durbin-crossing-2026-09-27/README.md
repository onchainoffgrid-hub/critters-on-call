# Critters on Call × Durbin Crossing — prize wheel

**Event date:** Sunday, September 27, 2026 · 10 AM – 1 PM  
**Location:** Durbin Crossing · 145 South Durbin Parkway, St Johns, FL 32259  
**Animal pickup:** 8:45 AM · Kate Smith / Vesta CDD  
**Event ID:** `durbin-crossing-2026-09-27`  
**Expires:** **2026-09-29 00:00:00 America/New_York** (end of Mon Sep 28 night) — page stays live; wheel non-functional with “Event ended”  
**Brand:** Forest `#4C6458`, deep `#3A4F45`, sage `#5A7366`, gold `#c9a227`. Hub = Critters on Call text. See `BRANDING.md`.  
**Farm claim address:** 44065 Cushman Road, Callahan, FL 32011

## Live URL (MUST stay exact)

https://onchainoffgrid-hub.github.io/critters-on-call/events/durbin-crossing-2026-09-27/

Goat variants: `?goat=01` … `?goat=12` — see `QR-STICKERS.md`.

## Local

```bash
cd /workspace/critters-on-call && python3 -m http.server 8766
```

http://localhost:8766/events/durbin-crossing-2026-09-27/

## Flow (psychology)

1. **Spin without email/phone** — no gate before the wheel.
2. Prize result shows **immediately** when the wheel stops.
3. Tap **“Claim your prize”** → email **OR** phone form (primary). Text GOAT / mailto remain secondary.
4. After claim succeeds → **Come to the farm to claim** + farm address + optional Google review. No tour push.
5. Max **3 spins** per device (anonymous localStorage) and per email/phone once identity is bound on claim. **Free spin does not count** against the 3.

## Rules (client-side)

- Max **3 spins** · free-spin wedge does **not** decrement
- On claim, bind device spin count to that email/phone (`coc_dc_identity_spins_v1_<EVENT_ID>`)
- **Golden Goat statue** hard-capped at **5** awards (`coc_dc_gold_awards_v1_<EVENT_ID>` + admin ±). At 5 → weight 0 + landings convert to $10 thrift. Copy: “only 5 gold statues at this event.”
- **Gold membership is uncapped** (only the physical statue is capped)
- Review link after claim: `https://g.page/r/CS74JMTm3xrWEAE/review`
- Leads: `localStorage` → staff `admin.html` CSV / mailto stub (PIN `0927`)

## Wheel (6 segments · equal 60° wedges) · weights sum 100%

| # | Prize | Weight | Notes |
|---|--------|--------|------|
| 0 | $10 thrift gift | **35%** | Teaser: comic book, basketball cards, tumbler · `DC10T-*` |
| 1 | $10 farm gift | **20%** | Teaser: elephant ear, sweet potato slip, fertilizer, eggs · `DC10F-*` |
| 2 | Golden Goat statue | **8%** | GRAND PRIZE — $100 value · **hard-capped at 5** |
| 3 | Gold membership | **10%** | $100 framing · uncapped |
| 4 | Free spin | **15%** | Does **not** count against 3-spin limit |
| 5 | Free $25 two-person farm tour ticket | **12%** | Teaser: bring a friend, no tour required to claim · `DC25X-*` |

**Removed:** $50 ticket, $25 thrift, $25 farm (as separate wedges), old spin-again label (replaced by Free spin). Ticket ceiling stays at $25.

## Files

- `index.html` — wheel + claim-after-spin + farm address + expiry  
- `admin.html` — CSV export + statue 0–5 counter  
- `hen-mark-gold.png` — hen mark (header/favicon only)  
- `qr/` — print QRs  
- `OUTLINE.md` — CRM warming  
- `QR-STICKERS.md` — 12 goat URLs  
- `BRANDING.md` — greens + logo flag  

## Deploy

```bash
cd /workspace/critters-on-call
git add events/durbin-crossing-2026-09-27
git commit -m "Durbin Crossing wheel: spin-first claim flow, 6 prizes, statue cap 5"
git push origin main
```

Live path must remain `/events/durbin-crossing-2026-09-27/` so goat stickers keep working.
