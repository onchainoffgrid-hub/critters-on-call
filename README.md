# Critters on Call

Sheehan Homestead · Callahan, FL

Sales aid: **Book · Track · Spin · Gold/Deals · Pricing**

Pricing (Family Menu locked Sep 16): https://onchainoffgrid-hub.github.io/critters-on-call/pricing.html

## Open
```bash
python3 -m http.server 8766
```
http://localhost:8766/

## Live
- Home: https://onchainoffgrid-hub.github.io/critters-on-call/
- **Games:** https://onchainoffgrid-hub.github.io/critters-play/
- **Wheel:** https://onchainoffgrid-hub.github.io/critters-on-call/wheel.html
- **Gold:** https://onchainoffgrid-hub.github.io/critters-on-call/gold.html

## Durbin Crossing event wheel (Sep 27, 2026)
- **Live:** https://onchainoffgrid-hub.github.io/critters-on-call/events/durbin-crossing-2026-09-27/
- Goat QRs: `?goat=01` … `?goat=12` — see `events/durbin-crossing-2026-09-27/QR-STICKERS.md`
- Staff CSV: `events/durbin-crossing-2026-09-27/admin.html` (PIN 0927)
- Outline (CRM + mom app): `events/durbin-crossing-2026-09-27/OUTLINE.md`

## Prize wheel (“How Sweet It Is”)
Eight slices: spin-again (Priceless) ×2 · Gold Membership ($50) ×2 · free farm gift ($25) · free thrift gift ($25) · free farm tour ($25) · Gold Pro nomination ($299).

First spin in a browser always lands on spin-again. After that, fair random among all eight. Claim gifts/tours in person; Gold / Gold Pro via `gold.html`. Soft upsell: screenshot + Critters game review + signed waiver for a free farm visit.


## Buzz demo (Play → one spin → doors)
Consumer path from Critters Play unlocks:

1. Play unlock (`?earn=gus|betty|elon`) grants **one** unclaimed spin (`coc_earned_wheel_spins_v1`)
2. Spin claims it — button becomes **Earned spin used** (no free re-spin on this path)
3. Three message doors appear (compose/links only — no payment):
   - Book: https://www.sheehanhomestead.com/booking-help (+ mobile book secondary)
   - Text: `sms:9142631311` body **GOAT**
   - Facebook: https://www.facebook.com/profile.php?id=61556795506312

Demo re-show: `wheel.html?earn=gus&demo=1` (reopens claimed earn).
