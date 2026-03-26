# CyberPulse

**Threat-to-Demand Intelligence Engine**

Turns cybersecurity threat events into qualified marketing pipeline.

## What it does

When a major threat event hits (ransomware campaign, nation-state disclosure, regulatory enforcement action), search demand for threat intelligence solutions spikes 300-700% within 48 hours. Then it decays. Most marketing teams miss the window entirely.

CyberPulse monitors threat intelligence feeds, correlates them with real-time search demand data, news velocity, and social signals, then generates an actionable campaign brief — who to target, what to say, which channels, expected pipeline — within hours of the event.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    THREAT INTELLIGENCE LAYER                  │
│  AlienVault OTX │ MITRE ATT&CK │ ENISA │ National CERTs     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    CORRELATION ENGINE                         │
│  Threat Events ──► Search Demand ──► News Velocity ──► Brief │
│                    (keyword model)    (RSS feeds)             │
└──────────────────────┬───────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
┌─────────────────┐  ┌─────────────────────────┐
│ Campaign         │  │ Live Feed               │
│ Scenarios        │  │ Real-time threats,       │
│ (curated briefs) │  │ search signals, news     │
└─────────────────┘  └─────────────────────────┘
```

## Two Views

### Campaign Scenarios (curated)
Pre-analyzed threat events with full campaign briefs: audience targeting, messaging frameworks, channel execution plans with budget/CPL/expected leads, and pipeline estimates.

Three curated scenarios:
1. **LockBit 4.0** — ransomware targeting DACH manufacturing
2. **NIS2 Enforcement** — EU Commission infringement proceedings
3. **Volt Typhoon** — Chinese APT in EU energy infrastructure

### Live Feed (real-time)
Pulls from live APIs:
- **Threats**: AlienVault OTX public pulse feed (auto-classified by severity, category, region, industry)
- **Search Demand**: Keyword correlation model mapping threat tags to search volume spikes
- **News**: RSS feeds from BleepingComputer, The Hacker News, Dark Reading, SecurityWeek, Krebs on Security (sentiment-scored, relevance-ranked)

## Data Sources

| Source | Type | Auth | Rate Limit |
|--------|------|------|------------|
| AlienVault OTX | Threat intel | None (public) | ~1000/day |
| Cybersecurity RSS | News | None | Cached 30min |
| Keyword Model | Search demand | None | In-memory |

## Key Design Decision

**Trigger on the threat event, not the search spike.** Google Trends API has ~48h delay. But threat feeds fire hours before search demand peaks. The search data validates the demand window; it doesn't trigger the response.

## How campaign briefs work

Each brief includes:

- **Demand window**: how long the spike lasts, decay rate
- **Target audience**: primary (e.g., CISOs at manufacturing companies), secondary (e.g., board members with NIS2 liability), addressable market size
- **Messaging framework**: hook (fear/relevance), value prop (what your product did), CTA (gated asset), compliance angle (regulatory leverage)
- **Channel execution plan**: LinkedIn Ads, email, SDR outbound, fast-turn webinar — with budget, expected leads, and CPL estimates
- **Pipeline estimate**: influenced pipeline within 30-45 days
- **KPIs**: success metrics defined before launch

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **APIs**: Next.js Route Handlers (serverless)
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
npx vercel --yes
```

## Roadmap

- [x] Interactive prototype with 3 curated threat scenarios
- [x] Live threat feed (AlienVault OTX)
- [x] Real-time news monitoring (RSS aggregation)
- [x] Search demand correlation model
- [ ] Anthropic Claude API for automated campaign brief generation from live threats
- [ ] Google Trends API integration for real search demand data
- [ ] Slack/email webhook for threat alert notifications
- [ ] CRM integration (HubSpot/Salesforce) for pipeline tracking
- [ ] Historical demand correlation database

## Origin

Built at the intersection of:
- **International Relations** (geopolitical threat analysis)
- **AI product engineering** (7 shipped marketing AI products)
- **B2B demand generation** (enterprise marketing for regulated buyers)

Specifically designed for cybersecurity companies selling threat intelligence to regulated enterprises — where threat events create time-sensitive marketing windows that require speed, accuracy, and compliance-aware messaging.

## Author

Mohamed Ali Mohamed — [GitHub](https://github.com/mohamedali170683-dotcom) — [LinkedIn](https://linkedin.com/in/mohamed170683)
