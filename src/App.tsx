import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDownIcon, ChevronDownIcon, PlusIcon, RefreshCwIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { clearLatest, fetchRates, RateTable } from "./lib/api";
import { BY_CODE, CURRENCIES, detectHomeCurrency, formatAmount, formatDate, formatRate } from "./lib/currencies";
import CurrencyBadge from "./components/CurrencyBadge";
import CurrencyPicker from "./components/CurrencyPicker";
import RateChart from "./components/RateChart";

type PickerTarget = "from" | "to" | "watch" | null;
const DEFAULT_WATCH = ["USD", "EUR", "GBP", "NGN", "JPY", "CAD", "CNY", "BTC"];

function readParams() {
  const p = new URLSearchParams(location.search);
  const valid = (c: string | null) => (c && BY_CODE.has(c.toUpperCase()) ? c.toUpperCase() : null);
  return { from: valid(p.get("from")), to: valid(p.get("to")), amount: p.get("amount") };
}

function loadWatchlist(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem("watchlist") || "null");
    if (Array.isArray(saved)) return saved.filter((c) => BY_CODE.has(c));
  } catch {
    /* ignore */
  }
  return DEFAULT_WATCH;
}

export default function App() {
  const initial = useMemo(() => {
    const p = readParams();
    const from = p.from ?? detectHomeCurrency();
    const to = p.to ?? (from === "USD" ? "EUR" : "USD");
    return { from, to, amount: p.amount ?? "1000" };
  }, []);

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [amount, setAmount] = useState(initial.amount);
  const [editing, setEditing] = useState<"from" | "to">("from");
  const [table, setTable] = useState<RateTable | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [watch, setWatch] = useState<string[]>(loadWatchlist);

  const load = useCallback(
    (fresh = false) => {
      if (fresh) clearLatest();
      setStatus("loading");
      fetchRates(from)
        .then((t) => {
          setTable(t);
          setStatus("ready");
        })
        .catch(() => setStatus("error"));
    },
    [from]
  );

  useEffect(() => load(), [load]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watch));
  }, [watch]);

  const rate = table?.rates[to.toLowerCase()] ?? null;
  const num = parseFloat(amount.replace(/,/g, "")) || 0;
  const fromValue = editing === "from" ? num : rate ? num / rate : 0;
  const toValue = editing === "to" ? num : rate ? num * rate : 0;

  // Keep the URL shareable
  useEffect(() => {
    const p = new URLSearchParams({ from, to, amount: String(+fromValue.toFixed(8)) });
    history.replaceState(null, "", `?${p}`);
  }, [from, to, fromValue]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setAmount(editing === "from" ? String(+fromValue.toFixed(8)) : String(+toValue.toFixed(8)));
  };

  const choose = (code: string) => {
    if (picker === "from") {
      if (code === to) setTo(from);
      setFrom(code);
    } else if (picker === "to") {
      if (code === from) setFrom(to);
      setTo(code);
    } else if (picker === "watch" && !watch.includes(code)) {
      setWatch([...watch, code]);
    }
  };

  const fromC = BY_CODE.get(from)!;
  const toC = BY_CODE.get(to)!;

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between">
        <a href="./" className="flex items-center gap-2.5">
          <img src="./currency-icon.svg" alt="" className="w-8 h-8" />
          <span className="font-display text-2xl tracking-tight">Exchange</span>
        </a>
        <span className="hidden sm:inline-flex items-center gap-2 text-sm text-muted">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full ${status === "error" ? "bg-down" : "bg-up"} opacity-60 animate-ping`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status === "error" ? "bg-down" : "bg-up"}`} />
          </span>
          {CURRENCIES.length} currencies · {table ? `rates for ${formatDate(table.date)}` : "loading rates"}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <section className="pt-10 sm:pt-16 pb-8 sm:pb-10 max-w-3xl">
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight">
            Every currency,
            <br />
            <em className="text-accent">one honest rate.</em>
          </h1>
          <p className="mt-4 text-lg text-muted max-w-xl">
            Convert between world currencies, crypto and precious metals at the mid-market rate — no fees, no markup.
          </p>
        </section>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 items-start">
          {/* Converter */}
          <section className="card p-2">
            <Field
              label="You convert"
              currency={fromC.code}
              name={fromC.name}
              value={editing === "from" ? amount : formatInput(fromValue)}
              onChange={(v) => {
                setEditing("from");
                setAmount(v);
              }}
              onPick={() => setPicker("from")}
            />

            <div className="relative h-2">
              <button
                onClick={swap}
                aria-label="Swap currencies"
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 z-10 h-11 w-11 rounded-full bg-ink text-paper grid place-items-center shadow-lg hover:rotate-180 transition-transform duration-300"
              >
                <ArrowUpDownIcon size={18} />
              </button>
            </div>

            <Field
              label="You get"
              currency={toC.code}
              name={toC.name}
              value={editing === "to" ? amount : formatInput(toValue)}
              onChange={(v) => {
                setEditing("to");
                setAmount(v);
              }}
              onPick={() => setPicker("to")}
              loading={status === "loading"}
            />

            <div className="px-5 py-4 flex items-center justify-between gap-3">
              {status === "error" ? (
                <p className="flex items-center gap-2 text-sm text-down">
                  <AlertTriangleIcon size={16} /> Couldn’t reach the rate service.
                </p>
              ) : rate ? (
                <div className="text-sm">
                  <p className="font-semibold tabular-nums">
                    1 {from} = {formatRate(rate)} {to}
                  </p>
                  <p className="text-muted tabular-nums">
                    1 {to} = {formatRate(1 / rate)} {from}
                  </p>
                </div>
              ) : status === "ready" ? (
                <p className="text-sm text-muted">No rate published for this pair today.</p>
              ) : (
                <div className="h-10 w-48 rounded-lg skeleton" />
              )}
              <button onClick={() => load(true)} className="icon-btn" aria-label="Refresh rates" disabled={status === "loading"}>
                <RefreshCwIcon size={17} className={status === "loading" ? "animate-spin" : ""} />
              </button>
            </div>
          </section>

          <RateChart from={from} to={to} />
        </div>

        {/* Watchlist */}
        <section className="card mt-5 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow mb-1">At a glance</p>
              <h2 className="font-display text-2xl">
                {formatAmount(fromValue)} {from} in other currencies
              </h2>
            </div>
            <button onClick={() => setPicker("watch")} className="chip gap-1">
              <PlusIcon size={15} /> Add
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {watch
              .filter((c) => c !== from)
              .map((code) => {
                const r = table?.rates[code.toLowerCase()];
                return (
                  <div key={code} className="group relative">
                    <button
                      onClick={() => setTo(code)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors ${
                        code === to ? "border-ink bg-ink/[0.03]" : "border-line hover:border-ink/40"
                      }`}
                    >
                      <CurrencyBadge code={code} size={34} />
                      <span className="min-w-0">
                        <span className="block font-semibold tabular-nums truncate">
                          {r ? formatAmount(fromValue * r) : "—"}
                        </span>
                        <span className="block text-xs text-muted">{code}</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setWatch(watch.filter((c) => c !== code))}
                      aria-label={`Remove ${code}`}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full grid place-items-center text-muted hover:bg-ink/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <XIcon size={13} />
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        <p className="text-xs text-muted mt-6 max-w-2xl">
          Mid-market reference rates, updated daily from the open-source{" "}
          <a className="underline" href="https://github.com/fawazahmed0/exchange-api" target="_blank" rel="noreferrer">
            Exchange API
          </a>
          . For information only — the rate you get from a bank or transfer provider may differ.
        </p>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink text-paper grid place-items-center text-sm font-semibold">JTO</div>
            <div>
              <p className="font-semibold">Joseph Theophilus Odubena</p>
              <p className="text-sm text-muted">Full Stack Developer · solving real problems with technology</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a className="hover:underline" href="https://www.linkedin.com/in/theophilus-odubena-180148180/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a className="hover:underline" href="https://github.com/1JTheo" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className="text-muted">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      <CurrencyPicker
        open={picker !== null}
        selected={picker === "from" ? from : picker === "to" ? to : ""}
        title={picker === "from" ? "Convert from" : picker === "to" ? "Convert to" : "Add to glance"}
        onSelect={choose}
        onClose={() => setPicker(null)}
      />
    </div>
  );
}

function formatInput(v: number) {
  if (!v) return "";
  if (Math.abs(v) >= 1) return String(Math.round(v * 100) / 100);
  return String(+v.toPrecision(4));
}

function Field({
  label,
  currency,
  name,
  value,
  onChange,
  onPick,
  loading,
}: {
  label: string;
  currency: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  onPick: () => void;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[22px] bg-paper/70 border border-line px-5 pt-4 pb-5 focus-within:border-ink/60 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">{label}</span>
        <span className="text-xs text-muted truncate ml-3">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          size={1}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
          placeholder="0"
          aria-label={`${label} amount in ${currency}`}
          className={`flex-1 w-0 min-w-0 bg-transparent outline-none font-display text-4xl sm:text-5xl tabular-nums placeholder:text-ink/25 ${
            loading ? "opacity-40" : ""
          }`}
        />
        <button
          onClick={onPick}
          className="flex items-center gap-2 h-12 pl-1.5 pr-3 rounded-full bg-card border border-line hover:border-ink/40 shadow-sm transition-colors shrink-0"
        >
          <CurrencyBadge code={currency} size={36} />
          <span className="font-semibold">{currency}</span>
          <ChevronDownIcon size={16} className="text-muted" />
        </button>
      </div>
    </div>
  );
}
