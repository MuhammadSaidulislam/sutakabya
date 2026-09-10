"use client";

import { ProductVariant } from "@/types/product";


type Props = {
  value: ProductVariant[];
  onChange: (value: ProductVariant[]) => void;
};

export default function ProductVariants({
  value,
  onChange,
}: Props) {
  const update = (
    index: number,
    field: keyof ProductVariant,
    val: string | number
  ) => {
    const items = [...value];
    items[index] = {
      ...items[index],
      [field]: val,
    };

    onChange(items);
  };

  const add = () => {
    onChange([
      ...value,
      {
        sku: "",
        color: "",
        size: "",
        stock: 0,
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-3">

      <div className="flex justify-between">
        <h3 className="font-semibold">Variants</h3>

        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-black px-3 py-1 text-white"
        >
          + Add
        </button>
      </div>

      {value.map((variant, index) => (

        <div key={index} className="grid grid-cols-4 gap-3">

          <input
            placeholder="Color"
            value={variant.color}
            onChange={(e) =>
              update(index, "color", e.target.value)
            }
            className="rounded-xl border px-3 py-2"
          />

          <input
            placeholder="Size"
            value={variant.size || ""}
            onChange={(e) =>
              update(index, "size", e.target.value)
            }
            className="rounded-xl border px-3 py-2"
          />

          <input
            type="number"
            placeholder="Stock"
            value={variant.stock}
            onChange={(e) =>
              update(index, "stock", Number(e.target.value))
            }
            className="rounded-xl border px-3 py-2"
          />

          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-lg border text-red-500"
          >
            Remove
          </button>

        </div>
      ))}
    </div>
  );
}