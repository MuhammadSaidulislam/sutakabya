export const Badge = ({ status }: { status: string }) => {
  const map: Record<string, [string, string]> = {
    Active: ["#16a34a", "#dcfce7"],
    Published: ["#16a34a", "#dcfce7"],
    Confirmed: ["#16a34a", "#dcfce7"],
    Approved: ["#16a34a", "#dcfce7"],

    Pending: ["#d97706", "#fef3c7"],
    PROCESSING: ["#d97706", "#fef3c7"],
    Review: ["#d97706", "#fef3c7"],
    "On Leave": ["#d97706", "#fef3c7"],

    // Payment Status
    PAID: ["#16a34a", "#dcfce7"],
    PENDING: ["#d97706", "#fef3c7"],
    REFUNDED: ["#ef4444", "#fee2e2"],

    // Delivery Status
    PREPARING: ["#d97706", "#fef3c7"],
    SHIPPED: ["#2563eb", "#dbeafe"],
    OUT_FOR_DELIVERY: ["#7c3aed", "#ede9fe"],
    DELIVERED: ["#16a34a", "#dcfce7"],
    FAILED: ["#ef4444", "#fee2e2"],

    Inactive: ["#6b7280", "#f3f4f6"],
    Cancelled: ["#6b7280", "#f3f4f6"],
    CANCELLED: ["#ef4444", "#fee2e2"],
    Rejected: ["#6b7280", "#f3f4f6"],

    Draft: ["#3b82f6", "#dbeafe"],

    Critical: ["#ef4444", "#fee2e2"],
    Urgent: ["#ef4444", "#fee2e2"],

    "Super Admin": ["#8b5cf6", "#ede9fe"],
    Admin: ["#3b82f6", "#dbeafe"],
    Moderator: ["#ec4899", "#fce7f3"],
  };

  const [tc, bg] = map[status] || ["#64748b", "#f1f5f9"];

  return (
    <span
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{
        background: bg,
        color: tc,
      }}
    >
      {status.replaceAll("_", " ").charAt(0).toUpperCase() +
        status.replaceAll("_", " ").slice(1).toLowerCase()}
    </span>
  );
};