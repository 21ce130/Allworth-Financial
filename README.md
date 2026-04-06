# Allworth Financial — Client Portal Dashboard

A live, interactive client dashboard built for Allworth Financial's wealth management clients.

## Features

- **Real-time market ticker** — S&P 500, NASDAQ, Dow, 10Y Yield, VIX, Gold with sparklines
- **Interest rates & macro panel** — Fed Funds, Prime, Treasury curve, Mortgage, CPI, Real Rate
- **Portfolio performance** — 90-day chart vs benchmark with show/hide balance toggle
- **Asset allocation** — Interactive donut chart (Equity, Fixed Income, Alternatives, Cash)
- **Holdings table** — Per-position value, weight bars, daily change
- **Financial goals tracker** — Retirement, estate, tax, insurance with progress
- **Retirement income projection** — Stacked bar chart through 2050
- **Activity feed** — Rebalances, dividends, tax-loss harvests, contributions
- **Advisor contact** — Direct scheduling CTA

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Opens at **http://localhost:3000**

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Vite** — Build tool
- **React 18** — UI framework
- **Recharts** — Charts & data visualization
- **Lucide React** — Icon library

## Next Steps (API Integration)

- Market data: Finnhub / Polygon.io / Alpha Vantage
- Portfolio: Custodial APIs (Schwab, Fidelity, Pershing)
- Rates: FRED API (Federal Reserve Economic Data)
- Auth: OAuth 2.0 / SSO integration
