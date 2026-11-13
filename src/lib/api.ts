// Free, key-less exchange rate API with 300+ currencies (fiat, crypto, metals)
// https://github.com/fawazahmed0/exchange-api — updated daily.
// Each request tries jsDelivr first, then the Cloudflare Pages mirror.

export type RateTable = { date: string; rates: Record<string, number> };

const sources = (tag: string, path: string) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${tag}/v1/${path}`,
  `https://${tag}.currency-api.pages.dev/v1/${path}`,
];

const cache = new Map<string, Promise<RateTable>>();

async function getJson(urls: string[]): Promise<any> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("Request failed");
}

/** All rates for `base` on a given day ("latest" or YYYY-MM-DD). */
export function fetchRates(base: string, date = "latest"): Promise<RateTable> {
  const b = base.toLowerCase();
  const key = `${b}@${date}`;
  if (!cache.has(key)) {
    const p = getJson(sources(date, `currencies/${b}.min.json`))
      .then((data) => ({ date: data.date as string, rates: data[b] as Record<string, number> }))
      .catch((err) => {
        cache.delete(key); // allow retry
        throw err;
      });
    cache.set(key, p);
  }
  return cache.get(key)!;
}

export function clearLatest() {
  for (const key of cache.keys()) if (key.endsWith("@latest")) cache.delete(key);
}

export type Range = "7D" | "1M" | "3M" | "1Y";
const RANGE_CONFIG: Record<Range, { days: number; step: number }> = {
  "7D": { days: 7, step: 1 },
  "1M": { days: 30, step: 2 },
  "3M": { days: 90, step: 5 },
  "1Y": { days: 365, step: 14 },
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

export type HistoryPoint = { date: string; rate: number };

/** Historical rate of base→quote, sampled across the range. */
export async function fetchHistory(base: string, quote: string, range: Range): Promise<HistoryPoint[]> {
  const { days, step } = RANGE_CONFIG[range];
  const today = new Date();
  const dates: string[] = [];
  for (let offset = days; offset >= 1; offset -= step) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - offset);
    dates.push(iso(d));
  }
  const q = quote.toLowerCase();
  const results = await Promise.allSettled([
    ...dates.map((d) => fetchRates(base, d)),
    fetchRates(base, "latest"),
  ]);
  const seen = new Set<string>();
  const points: HistoryPoint[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const rate = r.value.rates[q];
    if (!rate || seen.has(r.value.date)) continue;
    seen.add(r.value.date);
    points.push({ date: r.value.date, rate });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}
