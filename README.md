# Exchange — every currency, one honest rate

A fast, mobile-friendly currency converter for **339 currencies**: every world currency (including all African currencies — NGN, GHS, KES, XOF, XAF…), 130+ cryptocurrencies, precious metals and retired currencies.

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- **339 currencies** — fiat, crypto (BTC, ETH, USDT…), metals (gold, silver, platinum, palladium) and retired currencies (EEK, DEM, FRF…)
- **Two-way conversion** — type in either field
- **Searchable picker** — search by code or name ("naira", "bitcoin"), filter by World / Crypto / Metals / Retired, full keyboard support
- **Historical chart** — 7D / 1M / 3M / 1Y with hover readout and % change
- **At a glance** — your amount in a customisable list of currencies (saved in the browser)
- **Shareable links** — the URL keeps the pair and amount, e.g. `?from=EUR&to=NGN&amount=250`
- **Light & dark mode** following the system setting
- **No API key** — nothing to expire

## Data source

Rates come from the open-source [Exchange API](https://github.com/fawazahmed0/exchange-api) by Fawaz Ahmed: free, no key, no rate limits, updated daily. Requests go to jsDelivr first and fall back to the Cloudflare Pages mirror automatically. Historical data comes from the same API's dated snapshots.

Rates are mid-market reference rates for information only.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build in dist/
npm run preview
```

## Deploying to Netlify

Netlify picks up the build automatically:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node:** 20 or newer (set to 22 in `netlify.toml`)

No environment variables are needed.

## Project structure

```
src/
  App.tsx                     page layout, converter, at-a-glance list
  components/
    CurrencyPicker.tsx        searchable currency modal
    RateChart.tsx             SVG history chart
    CurrencyBadge.tsx         flag / code badge
  lib/
    api.ts                    rate fetching, mirrors, caching, history
    currencies.ts             currency list helpers and number formatting
    currencyData.ts           generated list of all 339 currencies
```

## Author

**Joseph Theophilus Odubena** — [LinkedIn](https://www.linkedin.com/in/theophilus-odubena-180148180/) · [GitHub](https://github.com/1JTheo)

MIT licensed.
