import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

const tones: Record<string, { bg: string; text: string }> = {
  blush: { bg: "bg-blush/20", text: "text-blush-deep" },
  sage: { bg: "bg-sage/20", text: "text-sage-deep" },
  honey: { bg: "bg-honey/20", text: "text-honey-deep" },
  sky: { bg: "bg-sky/20", text: "text-sky-deep" },
};

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "blush",
  prefix = "",
}: {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  tone?: "blush" | "sage" | "honey" | "sky";
  prefix?: string;
}) {
  const positive = change >= 0;
  const t = tones[tone];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bg} ${t.text}`}>
          <Icon size={19} strokeWidth={2.25} />
        </span>
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-[12px] font-semibold ${
            positive ? "bg-sage/15 text-sage-deep" : "bg-rose-danger/15 text-rose-danger"
          }`}
        >
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="mt-4 font-display text-[26px] font-semibold leading-none text-ink">
        {prefix}
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">{label}</p>
    </div>
  );
}
