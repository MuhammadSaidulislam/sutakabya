"use client";

import { AddCategoryProps } from "@/types/categories";
import { Plus, X } from "lucide-react";

export default function AddCategory({
    open,
    loading,
    editing,
    name,
    subCategories,
    setSubCategories,
    subCategory,
    addSubCategory,
    description,
    onNameChange,
    onSubChange,
    onDescriptionChange,
    onClose,
    onSubmit,
}: AddCategoryProps) {

    const removeSubCategory = (index: number) => {
        setSubCategories((prev) => prev.filter((_, i) => i !== index));
    };
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50  overflow-auto  flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4">
            <div className="w-full max-w-lg overflow-auto rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-ink">
                        {editing ? "Edit Category" : "Add Category"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 transition hover:bg-cream-deep"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            Category Name
                        </label>

                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="e.g. Baby Feeding"
                            className="w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-blush-deep"
                        />
                    </div>
                    {/* Sub Category */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            Sub-Categories
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={subCategory}
                                onChange={(e) => onSubChange(e.target.value)}
                                placeholder="Enter sub-category"
                                className="flex-1 rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-blush-deep"
                            />

                            <button
                                type="button"
                                onClick={addSubCategory}
                                className="flex items-center gap-2 rounded-xl bg-blush-deep px-4 text-white transition hover:bg-blush-deep/90"
                            >
                                <Plus size={18} />
                                Add
                            </button>
                        </div>
                    </div>
                    {/* List */}
                    {subCategories.length > 0 && (
                        <div>
                            <p className="mb-3 text-sm font-medium text-ink">
                                Added Sub-Categories
                            </p>

                            <div className="space-y-2 flex items-center flex-wrap">
                                {subCategories.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-xl border border-border bg-cream px-4 py-3"
                                    >
                                        <span className="text-xs text-ink">{item.name}</span>

                                        <button
                                            type="button"
                                            onClick={() => removeSubCategory(index)}
                                            className="rounded-full p-1 text-red-500 transition hover:bg-red-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            required
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            placeholder="Short description..."
                            className="w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none transition focus:border-blush-deep"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-ink-soft transition hover:bg-cream-deep disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-blush-deep py-3 text-sm font-semibold text-white transition hover:bg-blush-deep/90 disabled:opacity-50"
                        >
                           {editing ? "Edit Category" : "Add Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}