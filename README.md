# Project Walter — Commercial Intelligence Platform

A high-fidelity prototype for Bayleys' proprietary commercial property intelligence platform. Walter triangulates data across 113,000 commercial properties in New Zealand to predict lease events, identify opportunities, and deliver strategic insights to Bayleys agents.

## Overview

Project Walter is a property-centric predictive intelligence platform that combines:

- **Internal Bayleys IP** — 38,000+ verified CRM records and valuation reports
- **Regulatory APIs** — LINZ (titles, consents), NZBN (MBIE), Electricity Authority (ICP), Chorus (broadband)
- **Real-time listings** — realestate.co.nz integration for current and historical market data
- **Agentic reconnaissance** — OpenClaw web-scouring for tenant verification and business vitality
- **Custom LLM** — 220,000+ documents, 72,000 judicial decisions, and all NZ legislation
- **Microsoft 365** — email, calendar, and conversation intelligence

## Prototype Contents

### Main Application (`index.html`)
Seven core views accessible via the sidebar navigation:

- **Home** — Daily briefing with Priority Actions, Lease Pipeline, Market Pulse, Agent Activity, and My Calendar
- **Walter Chat** — Conversational AI with responses for property analysis, lease clauses, tribunal precedents, market queries
- **Market Intelligence** — Full Auckland map with interactive property pins, filtering, and 3-tab intel panel (Overview, Listings, Insights)
- **Properties** — Searchable table of 51 commercial properties with stickiness scores and status indicators
- **Listings** — 6 curated commercial listings from realestate.co.nz with Walter AI insights
- **Documents** — Dual workflow for lease review (single document) and lease comparison (multi-document) with Office 365 share preview
- **Settings** — Integrations (M365, LinkedIn, Meta, Uber, WhatsApp), Alert preferences, 4 pre-built AI Agents, and custom agent builder

### AI Agents
- **Zara** — Admin & task intelligence (scheduling, follow-ups, action prioritisation)
- **Wallace** — Commercial matchmaker (tenants ↔ listings, conjunctional opportunities)
- **Costello** — Market intelligence & reporting (weekly/monthly client reports)
- **Molloy** — Property value-add advisor (computer vision + ROI analysis)

### Standalone Client-Facing Reports
- **`client-report.html`** — Lease Comparison Report (Meridian Creative Ltd) with interactive cost calculator
- **`market-report.html`** — Costello's Grey Lynn Office Market Insight Report for Des Radonich Limited
- **`wallace-report.html`** — Wallace Matching Report with investor comparables and tenant matches

### Key Workflows Demonstrated
- **33 Crummer Road deep dive** — Comprehensive property intelligence with Bayleys relationship timeline, Molloy value-add recommendations, and Wallace matching
- **Walter Strategy Card** — Full strategic analysis for 24-28 Beaumont Street, Freemans Bay
- **Signal workflow** — 12 Nelson Street CBD showing new ICP activation lead
- **Costello market report** — End-to-end Office 365 share flow with web-based client report
- **Calendar integration** — Month/Week/Day views with M365 meetings + AI agent tasks + lease cycle alerts

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step. This is a high-fidelity prototype designed for stakeholder demonstrations and UX validation.

## File Structure

```
ProjectWalter/
├── index.html              # Main application
├── styles.css              # All styling
├── app.js                  # All interactions and simulated AI responses
├── client-report.html      # Lease comparison report (client-facing)
├── market-report.html      # Market intelligence report (client-facing)
├── wallace-report.html     # Opportunity matching report (client-facing)
├── bayleys-logo.png        # Brand asset
├── map-auckland.png        # Auckland commercial map background
├── listing-*.jpg           # 6 realestate.co.nz hero images
├── sv-*.png                # Street View property images
└── README.md               # This file
```

## Running Locally

This is a static site with no dependencies. To preview locally:

```bash
# Option 1: Python HTTP server
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Then open http://localhost:8000
```

## Deployment

Deployed via Netlify from this GitHub repository. See deployment instructions in the repository issues.

## Prepared by

**Will Alexander** — Head of Innovation, Bayleys Real Estate
will.alexander@bayleys.co.nz

## Confidentiality

This prototype contains commercially sensitive information and proprietary intellectual property belonging to Bayleys Real Estate Limited. Not for external distribution without written consent.
