# CyberPulse

**Threat-to-Demand Intelligence Engine**

Turns cybersecurity threat events into qualified marketing pipeline.

## What it does

When a major threat event hits (ransomware campaign, nation-state disclosure, regulatory enforcement action), search demand for threat intelligence solutions spikes 300-700% within 48 hours. Then it decays. Most marketing teams miss the window entirely.

CyberPulse monitors threat intelligence feeds, correlates them with real-time search demand data, news velocity, and social signals, then generates an actionable campaign brief — who to target, what to say, which channels, expected pipeline — within hours of the event.

## Architecture

```
Threat Feeds (MISP, CERT, ENISA)     Search Demand (Google Trends API, DataForSEO)
              │                                        │
              ▼                                        ▼
     ┌─────────────────────────────────────────────────────┐
     │              CyberPulse Correlation Engine           │
     │                                                     │
     │  1. Detect threat event (trigger)                   │
     │  2. Classify: severity, region, industry            │
     │  3. Pull search demand signals (validation)         │
     │  4. Aggregate news + social signals                 │
     │  5. Generate campaign brief via LLM                 │
     └─────────────────────────────────────────────────────┘
              │                    │                    │
              ▼                    ▼                    ▼
      Campaign Brief        Channel Plan         Pipeline Estimate
   (audience, messaging,   (LinkedIn, email,    (expected leads, CPL,
    compliance angle)       SDR, webinar)        influenced revenue)
```

## Data Sources

| Source | Purpose | API |
|--------|---------|-----|
| MISP / OpenCTI | Threat event detection (trigger) | MISP REST API |
| ENISA / CERT advisories | EU-specific threat context | RSS / scraper |
| Google Trends | Search demand spike validation | Google Trends API (alpha) |
| DataForSEO | Keyword volume, SERP data | DataForSEO API |
| NewsAPI / GDELT | News velocity measurement | REST API |
| LinkedIn / Twitter | Social signal aggregation | API / scraper |
| OpenAI / Claude | Campaign brief generation | LLM API |

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

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API routes + Python (FastAPI) for data processing
- **Database**: PostgreSQL (Supabase) for threat events + campaign history
- **LLM**: Claude API for campaign brief generation
- **Data**: DataForSEO (search volumes), MISP (threat feeds), Google Trends API
- **Deployment**: Vercel

## Project Status

**Phase**: Concept prototype (interactive demo with curated data)

**Roadmap**:
- [x] Interactive prototype with 3 curated threat scenarios
- [ ] Connect to live Google Trends API for real-time search demand
- [ ] Connect to MISP/OpenCTI for threat event ingestion
- [ ] LLM-powered campaign brief generation (replace curated briefs)
- [ ] HubSpot integration for direct campaign execution
- [ ] Historical analysis: backtest past threat events against pipeline data

## Origin

Built at the intersection of:
- **International Relations** (geopolitical threat analysis)
- **AI product engineering** (7 shipped marketing AI products)
- **B2B demand generation** (enterprise marketing for regulated buyers)

Specifically designed for cybersecurity companies selling threat intelligence to regulated enterprises — where threat events create time-sensitive marketing windows that require speed, accuracy, and compliance-aware messaging.

## Author

Mohamed Ali Mohamed — [GitHub](https://github.com/mohamedali170683-dotcom) — [LinkedIn](https://linkedin.com/in/mohamed170683)
