"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";
import ConfirmDialog from "@/components/ConfirmDialog";
import { campaigns as initialCampaigns } from "@/lib/data";

const channels: Campaign["channel"][] = ["EMAIL", "STORE_BANNER", "SMS", "SOCIAL_MEDIA"];
type Campaign = {
  id?: number;
  name: string;

  channel:
  | "EMAIL"
  | "STORE_BANNER"
  | "SMS"
  | "SOCIAL_MEDIA";

  discount_type:
  | "PERCENTAGE"
  | "FIXED";

  discount: string;

  target_type:
  | "ALL_PRODUCTS"
  | "CATEGORY"
  | "PRODUCT"
  | "CUSTOMER";

  minimum_order_amount: string;
  usage_limit: string;
  banner_image: string;
  priority: string;

  startDate: string;
  endDate: string;
  description: string;
  status: string;
};
const emptyForm = {
  name: "",
  channel: "EMAIL" as Campaign["channel"],
  discount_type: "PERCENTAGE" as Campaign["discount_type"],
  discount: "",
  target_type: "ALL_PRODUCTS" as Campaign["target_type"],
  minimum_order_amount: "",
  usage_limit: "",
  banner_image: "",
  priority: "0",
  startDate: "",
  endDate: "",
  description: "",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (campaign: Campaign) => {
    setEditing(campaign);
    setForm({
      name: campaign.name,
      channel: campaign.channel,
      discount_type: campaign.discount_type,
      discount: String(campaign.discount),

      target_type: campaign.target_type,
      minimum_order_amount: String(campaign.minimum_order_amount ?? ""),
      usage_limit: String(campaign.usage_limit ?? ""),
      banner_image: campaign.banner_image ?? "",
      priority: String(campaign.priority ?? 0),

      startDate: campaign.startDate,
      endDate: campaign.endDate,
      description: campaign.description ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;

    console.log("form",form);
    const today = new Date().toISOString().slice(0, 10);
     const status: Campaign["status"] = form.endDate < today ? "ENDED" : form.startDate > today ? "SCHEDULED" : "ACTIVE";

    // if (editing) {
    //   setCampaigns((prev) =>
    //     prev.map((c) =>
    //       c.id === editing.id
    //         ? {
    //             ...c,
    //             name: form.name,
    //             channel: form.channel,
    //             discount: Number(form.discount || 0),
    //             startDate: form.startDate,
    //             endDate: form.endDate,
    //             description: form.description,
    //             status,
    //           }
    //         : c
    //     )
    //   );
    // } else {
    //   const newCampaign: Campaign = {
    //     id: `CMP-${String(campaigns.length + 1).padStart(2, "0")}`,
    //     name: form.name,
    //     channel: form.channel,
    //     discount: Number(form.discount || 0),
    //     startDate: form.startDate,
    //     endDate: form.endDate,
    //     description: form.description,
    //     status,
    //     reach: 0,
    //   };
    //   setCampaigns((prev) => [newCampaign, ...prev]);
    // }
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} marketing campaigns across email, SMS, and social`}
        action={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blush-deep px-4 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
          >
            <Plus size={17} />
            New campaign
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky/20 text-sky-deep">
                  <Megaphone size={18} strokeWidth={2.25} />
                </span>
                <div>
                  <p className="font-display text-[15px] font-semibold text-ink">{campaign.name}</p>
                  <p className="text-[12.5px] text-ink-soft">{campaign.channel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={campaign.status} />
                <div className="flex gap-1">
                  <button
                    aria-label={`Edit ${campaign.name}`}
                    onClick={() => openEdit(campaign)}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-deep hover:text-ink"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    aria-label={`Delete ${campaign.name}`}
                    onClick={() => setDeleteTarget(campaign)}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-danger/10 hover:text-rose-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{campaign.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-soft">
              <span>{campaign.startDate} → {campaign.endDate}</span>
              {campaign.discount > 0 && (
                <span className="font-semibold text-honey-deep">{campaign.discount}% discount</span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {campaign.reach.toLocaleString()} reached
              </span>
            </div>
          </div>
        ))} */}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
            <h2 className="font-display text-[18px] font-semibold text-ink">
              {editing ? "Edit campaign" : "New campaign"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Campaign name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Monsoon Baby Essentials Sale"
                  className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Channel */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Channel
                  </label>

                  <select
                    value={form.channel}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        channel: e.target.value as Campaign["channel"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  >
                    {channels.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Discount Type */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Discount Type
                  </label>

                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value as Campaign["discount_type"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">

                {/* Discount */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  />
                </div>


                {/* Target */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Target
                  </label>

                  <select
                    value={form.target_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target_type: e.target.value as Campaign["target_type"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  >
                    <option value="ALL_PRODUCTS">
                      All Products
                    </option>

                    <option value="CATEGORY">
                      Category
                    </option>

                    <option value="PRODUCT">
                      Product
                    </option>

                    <option value="CUSTOMER">
                      Customer
                    </option>
                  </select>
                </div>

              </div>


              <div className="grid grid-cols-3 gap-3">

                {/* Minimum Order */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Min Order
                  </label>

                  <input
                    type="number"
                    value={form.minimum_order_amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minimum_order_amount: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px]"
                  />
                </div>


                {/* Usage Limit */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        usage_limit: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px]"
                  />
                </div>


                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Priority
                  </label>

                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px]"
                  />
                </div>

              </div>


              {/* Banner */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Banner Image URL
                </label>

                <input
                  value={form.banner_image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      banner_image: e.target.value,
                    })
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">Start date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">End date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this campaign about?"
                  className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/50"
                />
              </div>
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-[14px] font-semibold text-ink-soft hover:bg-cream-deep"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blush-deep py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
                >
                  {editing ? "Save changes" : "Create campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this campaign?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget?.id));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
