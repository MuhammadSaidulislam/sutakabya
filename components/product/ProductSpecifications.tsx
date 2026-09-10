"use client";
import { ProductSpecification } from "@/types/product";

type Props = {
  value: ProductSpecification[];
  onChange: (value: ProductSpecification[]) => void;
};

export default function ProductSpecifications({
  value,
  onChange,
}: Props) {
  const update = (
    index: number,
    field: keyof ProductSpecification,
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
        specification_name: "",
        specification_value: "",
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };



  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Specifications</h3>

        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-black px-3 py-1 text-white"
        >
          + Add
        </button>
      </div>

      {value.map((item, index) => (
        <div key={index} className="grid grid-cols-5 gap-3">

          <input
            placeholder="Name"
            value={item.specification_name}
            onChange={(e) =>
              update(index, "specification_name", e.target.value)
            }
            className="col-span-2 rounded-xl border px-3 py-2"
          />

          <input
            placeholder="Value"
            value={item.specification_value}
            onChange={(e) =>
              update(index, "specification_value", e.target.value)
            }
            className="col-span-2 rounded-xl border px-3 py-2"
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