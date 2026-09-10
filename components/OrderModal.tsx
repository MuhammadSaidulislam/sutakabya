import { FileText, X } from 'lucide-react'
import React from 'react'
import StatusPill from './StatusPill'

const OrderModal = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
            {/* <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-[18px] font-semibold text-ink">{selected.id}</h2>
                    <button
                        onClick={() => setSelected(null)}
                        aria-label="Close"
                        className="rounded-full p-1.5 text-ink-soft hover:bg-cream-deep hover:text-ink"
                    >
                        <X size={18} />
                    </button>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-y-3 text-[13.5px]">
                    <dt className="text-ink-soft">Customer</dt>
                    <dd className="text-right font-medium text-ink">{selected.customer}</dd>
                    <dt className="text-ink-soft">Mobile</dt>
                    <dd className="text-right font-medium text-ink">{selected.mobile}</dd>
                    <dt className="text-ink-soft">Date placed</dt>
                    <dd className="text-right font-medium text-ink">{selected.date}</dd>
                    <dt className="text-ink-soft">Payment</dt>
                    <dd className="text-right"><StatusPill status={selected.payment} /></dd>
                </dl>

                <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
                        Items ({itemCount(selected)})
                    </p>
                    <ul className="flex flex-col gap-2.5">
                        {selected.items.map((item) => (
                            <li key={item.productId} className="flex items-center gap-3">
                                 <ProductThumb image={item.image} /> 
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-ink">{item.name}</p>
                                    <p className="text-[12px] text-ink-soft">
                                        {item.qty} × ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="text-[13px] font-medium text-ink">
                                    ${(item.qty * item.price).toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex justify-between border-t border-border pt-3 text-[14px] font-semibold text-ink">
                        <span>Total</span>
                        <span>${selected.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-5">
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Update order status</label>
                    <select
                        value={selected.status}
                        onChange={(e) => updateStatus(selected.id, e.target.value as Order["status"])}
                        className="w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[14px] text-ink"
                    >
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        onClick={() => setInvoiceOrder(selected)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-[14px] font-semibold text-ink-soft hover:bg-cream-deep"
                    >
                        <FileText size={16} />
                        View invoice
                    </button>
                    <button
                        onClick={() => setSelected(null)}
                        className="flex-1 rounded-xl bg-blush-deep py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
                    >
                        Done
                    </button>
                </div>
            </div> */}
        </div>
    )
}

export default OrderModal