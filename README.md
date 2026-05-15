# homepitch.ro — Admin Dashboard

Real-time analytics dashboard for homepitch.ro powered by Google Analytics 4 (via Windsor.ai).

## Features
- 📊 Live GA4 metrics: DAU, sessions, engagement, bounce rate
- 🎯 Conversion tracking: briefs, onboarding, offer flow
- ⚡ Anomaly detection with Z-score + threshold-based alerts
- 🤖 AI Insights powered by Claude API
- 🔍 Search Console integration
- 🏙️ City-level breakdown with conversion rates
- 📋 Full PRD based on real data (downloadable)

## Data
All data is real — pulled from GA4 property 521779420 (homepitch.ro) via Windsor.ai connector, covering Apr 13 – May 12, 2026.

## Stack
- Next.js 14
- Chart.js + react-chartjs-2
- Anthropic Claude API (AI Insights panel)
- Windsor.ai (data source)
- Deployed on Vercel

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Connected to Vercel — push to main branch triggers automatic deployment.
