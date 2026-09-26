# Durbin Crossing wheel — CRM & mom-resource outline

**Event:** Critters on Call × Durbin Crossing · Sunday Sep 27, 2026  
**Event ID:** `durbin-crossing-2026-09-27`  
**Scope of this doc:** outline only — not a CRM build.

---

## 1. Lead-warming / CRM after the event

Captured fields (v1 localStorage → CSV / mailto / optional webhook):  
`email`, `phone`, `prize_id` / `prize_label`, `code`, `goat_id`, `timestamp`, `event_id`.

### Immediate (same night / next morning)
1. Export CSV from `admin.html` on the device(s) used at the amenity (or merge CSVs if multiple phones).
2. Tag every row in CRM / sheet: `source=durbin-crossing-wheel`, `event_date=2026-09-27`, `goat_id`, `prize`.
3. Deduplicate on email **and** phone (wheel already blocks double unlock; still clean merges).
4. Fulfill queue by prize kind:
   - **gift-10 / gift-25** — honor digital codes (`DC10-*` / `DC25-*`) at Visit Us; no paid merch.
   - **premium-goat** — activate free Critter/Gold Club-style membership + confirm Golden Goat statue handed out (match `goat_id`).
   - **vouchers** (Mommy & Me, car pass, goat yoga, stickers) — calendar / claim list; $0 fulfill.
   - **high-five / social** — soft nurture; confirm FB follow CTA landed.

### Warming sequence (suggested, not built)
| Day | Channel | Intent |
|-----|---------|--------|
| +0–1 | SMS or email | “Thanks for spinning at Durbin Crossing — here’s your code / how to redeem.” |
| +3 | Email | Soft Visit Us / services link; mention prize still valid. |
| +7 | Email / SMS | Mom-resource nudge (see §2) — value first, not hard sell. |
| +14 | Email | One clear CTA: book Visit Us or next Mommy & Me / goat yoga. |
| +30 | Email | Gold Club reminder only if they won premium or engaged; else seasonal farm invite. |

### Segment tips
- **Premium winners** → VIP lane; ask for photo with statue (UGC) + review.
- **Gift code winners** → convert Visit Us credit before expiry window you set (e.g. 60 days).
- **Social / joke prize** → content / follow list; lowest pressure.
- **St. Johns / Durbin ZIP phones** → community nurture; don’t blast unrelated B2B.

### Ops note
v1 lead store is **browser localStorage**. For production CRM sync: paste Apps Script / Form URL into `WEBHOOK_STUB` in `index.html`, or import CSVs into existing sheet/CRM. Staff PIN on admin is convenience only (0927), not security.

---

## 2. How this wheel connects to the mom resource app

The wheel is a **top-of-funnel amenity moment**. Mom-resource app (thought leadership + referrals — see `NOTES_mom_app_resources_2026-09-25.md`) is the **ongoing value layer** for parents captured at Durbin Crossing.

| Wheel moment | Mom-app handoff |
|--------------|-----------------|
| Email/phone unlock | Same contact becomes mom-app waitlist / first login identity later |
| Mommy & Me / yoga / farm vouchers | In-app “Experiences near you” cards deep-link to book flows |
| Visit Us gift codes | App “Redeem farm credit” explainer + hours / waiver |
| Premium membership + goat | App membership wallet + “my Golden Goat” badge (future) |
| Community event context | App “St. Johns / Durbin Crossing” neighborhood tip lane |

### Resource spine to surface in app (not sell)
- **VPK** → Early Learning Coalition of Duval (ELC Duval) eligibility / enrollment guidance — https://www.elcduval.org/
- **Step Up For Students** → homeschool / scholarship starting point — https://www.stepupforstudents.org/
- **ELC** → same coalition path for early learning questions (pair with VPK lane)
- **PEP** (parent education / parenting enrichment — keep as referral lane to trusted local partners; educational framing only)

Wheel copy should stay prize-first. Post-event emails can say: “Parents: we’re building a free mom resource hub (VPK, Step Up, ELC, parenting tips) — want early access?” That warms leads without turning the amenity spin into a compliance pitch.

---

## 3. Explicitly NOT started (follow-ons)

Per brief — do **not** treat these as done in this pass:

- Charity emails  
- Flyer for Anne-Marie / Canva  
- Text-queue leads automation  

List them as next tasks when event ops + CSV import are solid.

---

## 4. Suggested next tasks (after ship)

1. Push `critters-on-call` → confirm GitHub Pages URL live; print 12 goat QRs.  
2. Dry-run on phone: spin → unlock → admin CSV.  
3. Optional: Google Apps Script append webhook.  
4. Then: charity emails / Anne-Marie flyer / text-queue — separate tickets.
