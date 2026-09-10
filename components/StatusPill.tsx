const statusTones: Record<string, string> = {
  "In Stock": "bg-sage/15 text-sage-deep",
  "Low Stock": "bg-honey/15 text-honey-deep",
  "Out of Stock": "bg-rose-danger/15 text-rose-danger",
  Paid: "bg-sage/15 text-sage-deep",
  Pending: "bg-honey/15 text-honey-deep",
  Refunded: "bg-sky/15 text-sky-deep",
  Processing: "bg-sky/15 text-sky-deep",
  Shipped: "bg-honey/15 text-honey-deep",
  Delivered: "bg-sage/15 text-sage-deep",
  Cancelled: "bg-rose-danger/15 text-rose-danger",
  Preparing: "bg-sky/15 text-sky-deep",
  "In Transit": "bg-honey/15 text-honey-deep",
  "Out for Delivery": "bg-blush/20 text-blush-deep",
  Delayed: "bg-rose-danger/15 text-rose-danger",
  Published: "bg-sage/15 text-sage-deep",
  Hidden: "bg-rose-danger/15 text-rose-danger",
  Active: "bg-sage/15 text-sage-deep",
  Scheduled: "bg-sky/15 text-sky-deep",
  Expired: "bg-rose-danger/15 text-rose-danger",
  Ended: "bg-cream-deep text-ink-soft",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${
        statusTones[status] ?? "bg-cream-deep text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}
