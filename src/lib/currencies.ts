import { CURRENCY_DATA, CurrencyKind } from "./currencyData";

export type Currency = { code: string; name: string; kind: CurrencyKind; flag: string };

export const CURRENCIES: Currency[] = CURRENCY_DATA.map(([code, name, kind, flag]) => ({
  code: code.toUpperCase(),
  name,
  kind,
  flag,
}));

export const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export const POPULAR = ["USD", "EUR", "GBP", "NGN", "JPY", "CAD", "CNY", "INR", "ZAR", "GHS", "KES", "AED", "BTC"];

export const KIND_LABEL: Record<CurrencyKind, string> = {
  fiat: "World currencies",
  crypto: "Crypto",
  metal: "Precious metals",
  legacy: "Retired currencies",
};

// Locale → currency guess for a sensible starting pair
export function detectHomeCurrency(): string {
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const region = tag?.split("-")[1]?.toLowerCase();
    if (!region) continue;
    const hit = CURRENCIES.find((c) => c.kind === "fiat" && c.flag === region);
    if (hit) return hit.code;
    // Euro-area countries map to the EU flag in our data
    if (["at","be","cy","de","ee","es","fi","fr","gr","hr","ie","it","lt","lu","lv","mt","nl","pt","si","sk"].includes(region)) return "EUR";
  }
  return "EUR";
}

/** Format a money amount: 2 decimals for normal values, significant digits for tiny ones. */
export function formatAmount(value: number): string {
  if (!isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs === 0) return "0.00";
  if (abs >= 1) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toLocaleString(undefined, { maximumSignificantDigits: 4 });
}

/** Format an exchange rate with ~6 significant digits. */
export function formatRate(value: number): string {
  if (!isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return value.toLocaleString(undefined, { maximumSignificantDigits: 6 });
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { ...opts, timeZone: "UTC" });
}
