import { useState } from "react";
import { BY_CODE } from "../lib/currencies";

const KIND_STYLE: Record<string, string> = {
  crypto: "bg-accent/15 text-accent",
  metal: "bg-gold/20 text-gold",
  fiat: "bg-ink/10 text-ink",
  legacy: "bg-ink/10 text-muted",
};

export default function CurrencyBadge({ code, size = 28 }: { code: string; size?: number }) {
  const c = BY_CODE.get(code);
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (c?.flag && !failed) {
    return (
      <img
        src={`https://flagcdn.com/w80/${c.flag}.png`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={style}
        className="rounded-full object-cover ring-1 ring-ink/10 shrink-0 bg-ink/5"
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.32 }}
      className={`rounded-full shrink-0 grid place-items-center font-semibold tracking-tight ${KIND_STYLE[c?.kind ?? "fiat"]}`}
      aria-hidden
    >
      {code.slice(0, 3)}
    </span>
  );
}
