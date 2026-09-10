"use client";

import { Tag } from "@/types/product";

type Props = {
  value: Tag[];
  onChange: (value: Tag[]) => void;
};

export default function ProductTags({ value, onChange }: Props) {
    const update = (
      index: number,
      field: keyof Tag,
      val: string
    ) => {
      const items = [...value];
      items[index] = { ...items[index], [field]: val };
      onChange(items);
    };

    const add = () => {
    onChange([
      ...value,
      {
        tag: "",
      },
    ]);
  };
  // const add = () => {
  //   onChange([...value, ""]);
  // };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">
          Product Tags
        </h3>

        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-blush-deep px-4 py-2 text-sm font-medium text-white hover:bg-blush-deep/90"
        >
          + Add Tag
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          No tags added yet.
        </p>
      )}

      {value.map((t, index) => (
        <div key={index} className="flex gap-3">
          <input
            type="text"
            value={t.tag}
            placeholder="e.g. Organic"
            onChange={(e) => update(index, "tag", e.target.value)}
            className="flex-1 rounded-xl border border-border bg-cream px-3 py-2.5"
          />

          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-xl border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}