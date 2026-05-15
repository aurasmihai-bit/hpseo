# Product Requirements Document
## homepitch.ro — Reverse Real Estate Marketplace
### Version 1.1 · Based on Real GA4 Data · May 2026

---

## 1. PROBLEM STATEMENT

Romanian property buyers spend an average of 3–6 months scrolling listing portals (Imobiliare.ro, Storia.ro) with no guarantee that what they want exists. The supply-demand mismatch in Bucharest is severe — new apartment deliveries fell 20%+ YoY in 2025.

**homepitch.ro inverts the model**: buyers post what they want, agents and owners pitch to them.

### Evidence this is a real problem (from our own GA4 data)
- **907 unique users** visited in 30 days with zero paid acquisition budget
- **97% drop-off** between engaged session and completing onboarding — massive friction
- **0 offer_accepted events** in 30 days — the core loop is not yet closing
- **68% mobile traffic** with only 10% bounce — users are genuinely interested on mobile
- **Focsani anomaly**: 8 users → 7 buyer conversions (87.5% rate) — when the product works, it really works

---

## 2. TARGET USER PERSONAS

### Persona A — "Ioana" (Primary Buyer)
- **Age**: 28–40, urban professional
- **Location**: Bucharest (55% of traffic), Cluj, Timișoara
- **Behavior**: Browses on mobile (68% of sessions), engaged sessions avg 8min
- **Frustration**: Spent 4 months on Imobiliare.ro finding nothing matching her criteria
- **Willingness to pay**: €0 (buyers are free — monetization is on agents)
- **GA4 signal**: `bun_venit_cumparator` = 32 events, `bravo_cerere_noua` = 10 briefs posted

### Persona B — "Vasile" (Agent / Imobiliare Pro)
- **Age**: 30–55, licensed real estate agent
- **Behavior**: Returns on desktop (2.2 sessions/user vs 1.4 mobile), uses /admin/cereri heavily (2177 views, 5 users = admin power users)
- **Frustration**: Pays €200+/mo for Imobiliare.ro leads with low conversion
- **Willingness to pay**: €29–129/month subscription for qualified buyer briefs
- **GA4 signal**: `bun_venit_agent` = 2 events (very early stage)

### Persona C — "Maria" (Private Owner)
- **Age**: 35–65, selling without agent
- **Behavior**: Reached via direct traffic (116 users, highest conv rate — 48 prop events from direct)
- **Frustration**: Doesn't want to pay 3% agent commission
- **Willingness to pay**: Success fee model preferred
- **GA4 signal**: `bun_venit_proprietar` = 60 events — largest onboarded group

---

## 3. MARKET VALIDATION

| Competitor | Model | Weakness vs homepitch |
|---|---|---|
| Imobiliare.ro | Listing portal | Buyer is passive, supply-led |
| Storia.ro (OLX) | Listing portal | Same passive model, commoditized |
| Publi24 | Classifieds | Low quality, no matching |
| HomeLight (US) | Agent matching | Not in RO, different model |
| Properly (CA) | Demand-led | Not in RO |

**Verdict**: No direct Romanian competitor for demand-led real estate. Window is open.

---

## 4. CORE VALUE PROPOSITION

> **homepitch.ro is the only Romanian platform where you post what you want to buy and qualified agents compete for your attention — free for buyers, subscription for agents.**

---

## 5. FEATURE PRIORITIZATION — MoSCoW Matrix

### MUST HAVE (V1 — already partially built)
- [x] Buyer brief creation (`/cerere-noua` — 227 views, 128 users)
- [x] Brief listing for agents (`/cereri` — 2614 views, 238 users)
- [x] User onboarding flows (buyer/owner/agent split)
- [x] Offer sending by agents/owners
- [ ] **CRITICAL: `offer_accepted` event — 0 fires in 30 days. The acceptance flow must be fixed or built**
- [ ] Mobile-optimized brief creation (68% mobile traffic)
- [ ] Agent subscription (monetization gate)

### SHOULD HAVE (V1.5 — next 60 days)
- [ ] Push/email notification when brief receives offer
- [ ] Buyer ↔ Agent messaging thread
- [ ] Brief expiry + renewal (30-day TTL)
- [ ] Agent rating after interaction
- [ ] /simplu landing page optimization (313 views, 119 users — high traffic, needs A/B test)

### COULD HAVE (V2 — post revenue)
- [ ] AI-powered brief-to-listing matching score
- [ ] Map view of brief locations
- [ ] Mortgage calculator integration
- [ ] Saved search alerts for agents
- [ ] Referral program (Focsani anomaly shows word-of-mouth works)

### WON'T HAVE (V1)
- Mobile app (web is performing well, 10% bounce on mobile)
- International expansion
- Auction/bidding mechanism
- Property management tools

---

## 6. USER STORIES (15 core)

1. **As a buyer**, I want to post what apartment I'm looking for in under 3 minutes, so that agents come to me instead of me browsing thousands of listings.

2. **As a buyer**, I want to receive push/email notifications when I get an offer on my brief, so that I don't have to keep checking the platform.

3. **As a buyer**, I want to see all offers on my brief in one view with price, photos, and agent rating, so that I can compare quickly on mobile.

4. **As a buyer**, I want to accept an offer with one tap and initiate contact with the agent, so that the platform actually closes the loop. *(offer_accepted = 0 — this is the #1 broken flow)*

5. **As a buyer**, I want my brief to expire after 30 days unless I renew it, so that agents only see active demand.

6. **As an agent**, I want to browse all active buyer briefs filtered by city, budget, and property type, so that I only spend time on relevant leads.

7. **As an agent**, I want a subscription that lets me respond to unlimited briefs per month, so that I have predictable lead costs vs per-lead pricing.

8. **As an agent**, I want to see how many agents have already responded to a brief, so that I can assess competition before investing time.

9. **As an agent**, I want a dashboard showing my response rate, acceptance rate, and conversion to viewing, so that I can optimize my pitches.

10. **As an owner**, I want to respond to buyer briefs without an agent account, so that I can sell my property directly without paying commission.

11. **As an owner**, I want to be notified when a brief matching my property's profile is posted, so that I can respond while the buyer is still active.

12. **As an admin**, I want to see real-time anomalies in traffic and conversions, so that I can detect and respond to issues within hours not days. *(built in the analytics dashboard)*

13. **As an admin**, I want to see the full activation funnel from visit to accepted offer, so that I know exactly where to focus product effort.

14. **As a new visitor**, I want to understand the concept in under 10 seconds on the homepage, so that I don't bounce. *(Apr 21 bounce = 39% — homepage needs work)*

15. **As a mobile user**, I want the brief creation flow to take under 3 taps before I see the form, so that I don't abandon on small screens.

---

## 7. SUCCESS METRICS — Launch Month Targets

| Metric | Current (30d) | Target (60d) | Target (90d) |
|---|---|---|---|
| DAU | ~30 (May avg) | 80 | 150 |
| Briefs posted/month | 10 | 40 | 100 |
| Offers sent/brief | unknown | 3+ | 5+ |
| **offer_accepted events** | **0** | **10** | **40** |
| Onboarding completion | ~3% (32/907) | 15% | 25% |
| Agent subscriptions | ~0 | 10 | 30 |
| MRR | €0 | €500 | €2,000 |
| Mobile bounce rate | 10% ✓ | <10% | <8% |

---

## 8. CRITICAL BUGS / TRACKING GAPS

Based on 30 days of real GA4 data, these must be fixed before any growth investment:

1. **`offer_accepted` = 0** — Either the event is not tagged in GA4, or the UI flow for accepting an offer is broken/missing. **Priority: P0.**
2. **97% drop-off between engaged session and onboarding** — The path from homepage to `bun_venit_*` event is broken for most users. Audit the signup flow immediately.
3. **May traffic cliff (−75% vs April)** — Identify which channel drove April traffic (likely a Facebook campaign that stopped) and reactivate.
4. **April 28 proprietar spike (42 events)** — Unknown cause. Find it, reproduce it. This is your growth lever.
5. **Bot/VPN traffic** — Cheyenne WY, Council Bluffs IA, Flint Hill VA in top cities = likely bot sessions. Add GA4 filters.

---

## 9. MVP SCOPE

### Weekend Build (already done / close)
- ✅ Brief posting flow
- ✅ Agent/owner/buyer onboarding
- ✅ Brief listing for agents
- ✅ Admin dashboard
- ❌ Offer acceptance flow (build this weekend)

### V2 Post-Validation (after 10 accepted offers)
- Agent subscription paywall
- Notification system
- Messaging thread
- Rating system
- SEO landing pages for non-branded keywords

---

## 10. SEO OPPORTUNITY (from Search Console data)

Current state: **100% branded search** ("homepitch", "home pitch" = 33 of 44 clicks).

Zero ranking for any transactional real estate keywords. Immediate opportunities:

| Target keyword | Intent | Difficulty |
|---|---|---|
| cumpăr apartament bucurești | Buyer — high intent | Medium |
| vreau să cumpăr apartament | Buyer — high intent | Low |
| apartament 2 camere bucurești buget | Buyer — specific | Low |
| vând apartament fără agent | Owner | Low |
| oferte imobiliare cumpărători | Mixed | Medium |

**Recommendation**: Create 5 city-specific landing pages (/cauta-apartament-bucuresti, /cauta-apartament-cluj etc.) targeting these keywords. Each page = brief creation CTA. Estimated: 500–2000 organic visits/month within 6 months.

---

*Document generated May 2026 · Based on real GA4 data from Windsor.ai connector · homepitch.ro property 521779420*
