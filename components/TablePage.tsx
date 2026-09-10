import { TablePageProps } from "@/types/table";
import { ChevronLeft, ChevronRight, FileX2Icon, Plus } from "lucide-react";

export const TablePage = ({
    title,
    subtitle,
    addLabel,
    headers,
    onAddClick,
    rows,
    page = 1,
    totalPages = 1,
    totalItems = 1,
    onPageChange,
    search,
    setSearch
}: TablePageProps) => (
    <>

        {/* Header */}

        {/* <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
            <div>
                <h1 className="font-display text-[24px] font-semibold text-white sm:text-[28px]">{title}</h1>
                {subtitle && <p className="mt-1 text-[13.5px] text-ink-soft">{subtitle}</p>}
            </div>

            <div className="flex gap-2.5 flex-wrap items-center">
                <input placeholder="Search…" className="w-[200px] h-10 px-3 bg-white border rounded-lg outline-none "
                    value={search} onChange={(e) => setSearch(e.target.value)}
                />

                {addLabel && (
                    <button
                        onClick={onAddClick}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blush-deep px-4 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
                    >
                        <Plus size={17} /> {addLabel}
                    </button>
                )}
            </div>
        </div> */}

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
            {totalPages === 0 ?  <div className="flex flex-col py-10 items-center justify-center">
              <div className="mb-4 flex  items-center justify-center rounded-full bg-gray-100">
                <FileX2Icon size={25} />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No data found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                There are no records to display.
              </p>
            </div> : <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[13.5px]">
                    <thead className="bg-cream-deep/50">
                        <tr className="text-ink  whitespace-nowrap">
                            {headers.map((h) => (
                                <th key={h} className="px-5 py-3 font-semibold ">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="[&_td]:py-3 [&_td]:px-5">{rows}</tbody>
                </table>
            </div> }

            {/* Pagination */}
            {totalPages === 0 ? "" :
                <div className="flex items-center justify-between mt-5 px-5 mb-5">
                    <p className="text-sm text-ink font-semibold">
                        Page {page} of {totalPages} • Total Items: {totalItems}
                    </p>

                    <div className="flex items-center gap-2">
                        {/* Prev Button */}
                        <button
                            onClick={() => onPageChange?.(page - 1)}
                            disabled={page === 1}
                            className="w-7 h-7 flex justify-center items-center cursor-pointer text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-blush-deep hover:border-blush-deep transition"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;

                            return (
                                <button
                                    key={p}
                                    onClick={() => onPageChange?.(p)}
                                    className={`w-7 h-7 cursor-pointer text-sm rounded-lg border transition ${p === page
                                        ? "bg-blush-deep text-white border-blush-deep shadow-sm"
                                        : "hover:bg-emerald-50 hover:text-blush-deep hover:border-blush-deep"
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button
                            onClick={() => onPageChange?.(page + 1)}
                            disabled={page >= totalPages || totalPages === 0}
                            className="w-7 h-7  flex justify-center items-center cursor-pointer text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-blush-deep hover:border-blush-deep transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            }
        </div>


    </>
);