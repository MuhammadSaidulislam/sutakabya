'use client'

import { useState, type Dispatch, type SetStateAction, type ReactNode, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { Color, Filters, ProductProps, Size } from '@/types/product';
import { Category } from '@/types/categories';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between"
      >
        <h3 className="text-[15px] font-semibold text-gray-900 tracking-wide">
          {title}
        </h3>

        <ChevronDown
          size={18}
          className={`text-gray-500 transition-all duration-300 group-hover:text-pink-500 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${open
          ? "grid-rows-[1fr] mt-4"
          : "grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function FilterSidebar({
  priceRange,
  colorFilter,
  sizeFilter,
  filters,
  setFilters,
  products,
  categories
}: {
  priceRange: { minPrice: number; maxPrice: number; }
  colorFilter: Color[]
  sizeFilter: Size[]
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  products: ProductProps[]
  categories: Category[]
}) {

  const toggleArrayValue = (key: 'size' | 'color', value: string) => {
    setFilters((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const categoryParam = searchParams.get("category") ?? "";
const subCategoryParam = searchParams.get("subCategory") ?? "";

const selectedCategories = categoryParam
  .split(",")
  .filter(Boolean);

const selectedSubCategories = subCategoryParam
  .split(",")
  .filter(Boolean);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleCategorySelection = (slug: string) => {
  const currentCategories =
    searchParams.get("category")?.split(",").filter(Boolean) ?? [];

  const currentSubCategories =
    searchParams.get("subCategory")?.split(",").filter(Boolean) ?? [];

  const isSelected = currentCategories.includes(slug);

  const updatedCategories = isSelected
    ? currentCategories.filter((item) => item !== slug)
    : [...currentCategories, slug];

  // If category is being unselected,
  // remove all subcategories belonging to that category.
  let updatedSubCategories = currentSubCategories;

  if (isSelected) {
    const category = categories.find(
      (item) => String(item.slug) === slug
    );

    const categorySubSlugs =
      category?.subCategories?.map((sub) => String(sub.slug)) ?? [];

    updatedSubCategories = currentSubCategories.filter(
      (subSlug) => !categorySubSlugs.includes(subSlug)
    );
  }

  const params = new URLSearchParams(searchParams.toString());

  if (updatedCategories.length > 0) {
    params.set("category", updatedCategories.join(","));
  } else {
    params.delete("category");
  }

  if (updatedSubCategories.length > 0) {
    params.set("subCategory", updatedSubCategories.join(","));
  } else {
    params.delete("subCategory");
  }

  router.push(`${pathname}?${params.toString()}`, {
    scroll: false,
  });
};

 const toggleSubCategorySelection = (
  slug: string,
  parentCategorySlug: string
) => {
  const currentCategories =
    searchParams.get("category")?.split(",").filter(Boolean) ?? [];

  const currentSubCategories =
    searchParams.get("subCategory")?.split(",").filter(Boolean) ?? [];

  const isSelected = currentSubCategories.includes(slug);

  const updatedSubCategories = isSelected
    ? currentSubCategories.filter((item) => item !== slug)
    : [...currentSubCategories, slug];

  let updatedCategories = currentCategories;

  // Selecting a subcategory automatically selects its parent.
  if (!isSelected && !currentCategories.includes(parentCategorySlug)) {
    updatedCategories = [
      ...currentCategories,
      parentCategorySlug,
    ];
  }

  const params = new URLSearchParams(searchParams.toString());

  if (updatedCategories.length > 0) {
    params.set("category", updatedCategories.join(","));
  } else {
    params.delete("category");
  }

  if (updatedSubCategories.length > 0) {
    params.set("subCategory", updatedSubCategories.join(","));
  } else {
    params.delete("subCategory");
  }

  router.push(`${pathname}?${params.toString()}`, {
    scroll: false,
  });
};

  return (
    <div className="w-full">
      {/* Filter category */}
      <FilterSection title="Category">
        {categories.map((category) => {
          const isOpen = openCategories.includes(category.id);

          return (
            <div key={category.id} className="border-b border-gray-100 pb-2">
              {/* Category */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer flex-1 group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(String(category.slug))}
                    onChange={() =>
                      toggleCategorySelection(String(category.slug))
                    }
                    className="h-4 w-4 rounded border-gray-300 accent-rose-400"
                  />

                  <span className="text-sm font-medium text-gray-700 group-hover:text-rose-500">
                    {category.name}
                  </span>
                </label>

                {category.subCategories?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    {isOpen ? "−" : "+"}
                  </button>
                )}
              </div>

              {/* Sub Categories */}
              {isOpen && category.subCategories?.length > 0 && (
                <div className="mt-2 ml-7 space-y-2">
                  {category.subCategories.map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(String(sub.slug))}
                        onChange={() =>
                          toggleSubCategorySelection(String(sub.slug),String(category.slug))
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-rose-400"
                      />

                      <span className="text-sm text-gray-500 group-hover:text-rose-500">
                        {sub.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Maximum Price
            </span>

            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-500">
              ৳ {filters.selectedPrice ? filters.selectedPrice : priceRange.maxPrice}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={priceRange.minPrice}
            max={priceRange.maxPrice}
            step={5}
            value={filters.selectedPrice ? filters.selectedPrice : priceRange.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                selectedPrice: Number(e.target.value),
              }))
            }
            className="custom-range w-full"
          />

          {/* Min & Max */}
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>${priceRange.minPrice}</span>
            <span>${priceRange.maxPrice}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {sizeFilter.map((s) => {
            const active = filters.size.includes(s.size);

            return (
              <button
                key={s.size}
                onClick={() => toggleArrayValue("size", s.size)}
                className={`
        px-4 py-2 rounded-full text-sm font-medium
        border-2 transition-all duration-200
        ${active
                    ? "border-pink-500 text-pink-600 bg-pink-50"
                    : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }
      `}
              >
                {s.size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3 py-2 px-1">
          {colorFilter.map((c) => {
            const active = filters.color.includes(c.color);

            return (
              <button
                key={c.color}
                onClick={() => toggleArrayValue("color", c.color)}
                className={`
        relative w-8 h-8 rounded-full
        ${active ? "ring-2 ring-pink-500 ring-offset-2" : ""}
      `}
                aria-label={c.color}
              >
                <div
                  className="w-full h-full rounded-full border border-gray-300"
                  style={{ backgroundColor: c.color.toLowerCase() }}
                />

                {active && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <button
        onClick={() => setFilters({ size: [], color: [], selectedPrice: 0, sort: "newest" })}
        className="mt-5 text-sm text-blush-500 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  )
}
