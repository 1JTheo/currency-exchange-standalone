import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { CURRENCIES, KIND_LABEL, POPULAR, BY_CODE, Currency } from "../lib/currencies";
import type { CurrencyKind } from "../lib/currencyData";
import CurrencyBadge from "./CurrencyBadge";

type Tab = "all" | CurrencyKind;
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fiat", label: "World" },
  { id: "crypto", label: "Crypto" },
  { id: "metal", label: "Metals" },
  { id: "legacy", label: "Retired" },
];

export default function CurrencyPicker({
  open,
  selected,
  onSelect,
  onClose,
  title,
}: {
  open: boolean;
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
  title: string;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CURRENCIES.filter((c) => tab === "all" || c.kind === tab);
    if (q) {
      list = list
        .filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
        .sort((a, b) => score(b, q) - score(a, q));
    } else {
      // Fiat first, then crypto, metals, retired; alphabetical within
      const order: Record<CurrencyKind, number> = { fiat: 0, crypto: 1, metal: 2, legacy: 3 };
      list = [...list].sort((a, b) => order[a.kind] - order[b.kind] || a.code.localeCompare(b.code));
    }
    return list;
  }, [query, tab]);

  useEffect(() => setActive(0), [query, tab]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const pick = (code: string) => {
    onSelect(code);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) pick(results[active].code);
  };

  let lastKind: CurrencyKind | null = null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-lg h-[85vh] sm:h-[640px] bg-paper rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-rise"
      >
        <div className="px-5 pt-5 pb-3 border-b border-line">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">{title}</h2>
            <button onClick={onClose} className="icon-btn" aria-label="Close">
              <XIcon size={18} />
            </button>
          </div>
          <label className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-card border border-line focus-within:border-ink transition-colors">
            <SearchIcon size={18} className="text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${CURRENCIES.length} currencies, e.g. naira, BTC`}
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted"
            />
          </label>
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`chip ${tab === t.id ? "chip-on" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-2 py-2">
          {!query && tab === "all" && (
            <div className="px-3 pt-2 pb-4">
              <p className="eyebrow mb-2">Popular</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR.filter((c) => BY_CODE.has(c)).map((code) => (
                  <button key={code} onClick={() => pick(code)} className="chip gap-1.5 pl-1.5">
                    <CurrencyBadge code={code} size={20} />
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && (
            <p className="text-center text-muted py-16">No currency matches “{query}”.</p>
          )}

          {results.map((c, i) => {
            const header = !query && c.kind !== lastKind ? KIND_LABEL[c.kind] : null;
            lastKind = c.kind;
            return (
              <div key={c.code}>
                {header && <p className="eyebrow px-3 pt-4 pb-2">{header}</p>}
                <button
                  data-index={i}
                  onClick={() => pick(c.code)}
                  onMouseMove={() => setActive(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    i === active ? "bg-ink/[0.06]" : ""
                  }`}
                >
                  <CurrencyBadge code={c.code} size={32} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold">{c.code}</span>
                    <span className="block text-sm text-muted truncate">{c.name}</span>
                  </span>
                  {c.code === selected && <span className="text-xs font-semibold text-accent">Selected</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function score(c: Currency, q: string) {
  const code = c.code.toLowerCase();
  const name = c.name.toLowerCase();
  let s = 0;
  if (code === q) s += 100;
  else if (code.startsWith(q)) s += 50;
  if (name.startsWith(q)) s += 30;
  else if (name.split(" ").some((w) => w.startsWith(q))) s += 20;
  if (c.kind === "fiat") s += 5;
  if (c.kind === "legacy") s -= 5;
  return s;
}
