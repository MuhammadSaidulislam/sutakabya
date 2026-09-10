"use client";

import { useState, useEffect, } from "react";
import { X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { ProductProps } from "@/types/product";
import { Category, SubCategory } from "@/types/categories";
import { toast } from "@/lib/toast";
import ProductSpecifications from "./product/ProductSpecifications";
import ProductVariants from "./product/ProductVariants";
import ProductTags from "./product/ProductTags";


export default function ProductModal({
  open,
  onClose,
  categories,
  initialProduct,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initialProduct?: ProductProps | null;
}) {
  const [form, setForm] = useState<Partial<ProductProps>>({
    // Basic Information
    name: initialProduct?.name ?? "",
    slug: initialProduct?.slug ?? "",
    sku: initialProduct?.sku ?? "",

    // Category
    category_id: initialProduct?.category_id ?? 0,
    sub_category_id: initialProduct?.sub_category_id ?? 0,

    // Description
    short_description: initialProduct?.short_description ?? "",
    description: initialProduct?.description ?? "",

    // Pricing
    price: initialProduct?.price ?? 0,
    cost_price: initialProduct?.cost_price ?? 0,
    offer_price: initialProduct?.offer_price ?? 0,

    // Inventory
    stock: initialProduct?.stock ?? 0,
    low_stock_threshold: initialProduct?.low_stock_threshold ?? 5,

    // Status
    status: initialProduct?.status ?? "IN_STOCK",

    // Product Flags
    featured: initialProduct?.featured ?? false,
    best_seller: initialProduct?.best_seller ?? false,
    new_arrival: initialProduct?.new_arrival ?? false,

    // SEO
    meta_title: initialProduct?.meta_title ?? "",
    meta_description: initialProduct?.meta_description ?? "",

    // Images
    images: initialProduct?.images ?? [],

    // Specifications
    specifications: initialProduct?.specifications ?? [],

    // Tags
    tags: initialProduct?.tags ?? [],

    // Variants
    variants: initialProduct?.variants ?? [],
  });
  console.log("initialProduct", initialProduct);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const handleCategoryChange = (categoryId: number) => {
    
    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
    }));

    const category = categories.find((c) => String(c.id) === String(categoryId));
    setSubCategories(category?.subCategories ?? []);
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.slug ||
      !form.sku ||
      !form.price
    ) {
      toast({
        message: "Please fill all required fields.",
        position: "top-right",
        type: "error",
      });
      return;
    }

    try {
      // Upload Images
      const uploadedImages = await Promise.all(
        (form.images ?? []).map(async (image) => {
          if (
            image.id ||
            image.image_url.startsWith("http") ||
            image.image_url.startsWith("/")
          ) {
            return {
              id: image.id,
              image_url: image.image_url,
              is_thumbnail: image.is_thumbnail,
            };
          }

          const formData = new FormData();

          const blob = await fetch(image.image_url).then((r) => r.blob());

          const file = new File([blob], `product-${Date.now()}.png`, {
            type: blob.type,
          });

          formData.append("image", file);
          formData.append("folder", "products");

          const uploadRes = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            throw new Error(uploadData.message);
          }

          return {
            image_url: uploadData.image,
            is_thumbnail: image.is_thumbnail,
          };
        })
      );

      const payload = {
        // Basic
        name: form.name,
        slug: form.slug,
        sku: form.sku,

        // Category
        category_id: Number(form.category_id),
        sub_category_id:
          form.sub_category_id && form.sub_category_id > 0
            ? Number(form.sub_category_id)
            : null,

        // Description
        short_description: form.short_description,
        description: form.description,

        // Pricing
        price: Number(form.price),
        cost_price: Number(form.cost_price ?? 0),
        offer_price: Number(form.offer_price ?? 0),

        // Inventory
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold ?? 5),

        // Status
        status: form.status,

        // Flags
        featured: Boolean(form.featured),
        best_seller: Boolean(form.best_seller),
        new_arrival: Boolean(form.new_arrival),

        // SEO
        meta_title: form.meta_title,
        meta_description: form.meta_description,

        // Relations
        images: uploadedImages,

        tags: form.tags ?? [],

        specifications: form.specifications ?? [],

        variants: form.variants ?? [],
      };

      const isEdit = !!initialProduct;

      const res = await fetch(
        isEdit
          ? `/api/admin/product?id=${initialProduct.id}`
          : "/api/admin/product",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast({
          message: result.message || "Failed to save product.",
          position: "top-right",
          type: "error",
        });
        return;
      }

      toast({
        message: isEdit
          ? "Product updated successfully."
          : "Product created successfully.",
        position: "top-right",
        type: "success",
      });

      onClose();
    } catch (error) {
      console.error(error);

      toast({
        message: initialProduct
          ? "Product update failed."
          : "Product creation failed.",
        position: "top-right",
        type: "error",
      });
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 sm:max-w-lg sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-semibold text-ink">
            {initialProduct ? "Edit product" : "Add new product"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-soft hover:bg-cream-deep hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Images */}
          <ImageUploader
            images={form.images ?? []}
            onChange={(images) =>
              setForm((prev) => ({
                ...prev,
                images,
              }))
            }
          />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Product Name</label>
              <input required value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">SKU</label>
              <input required value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sku: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">Slug</label>
              <input required value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
              <select value={form.category_id ?? ""} onChange={(e) => handleCategoryChange(Number(e.target.value))}  className="w-full rounded-xl border border-border bg-cream px-4 py-2.5">
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Sub Category</label>
            {subCategories.length ? <select value={form.sub_category_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sub_category_id: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              >
                <option value={0}>Select Sub Category</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>  : initialProduct?.sub_category_name } 
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>

              <select value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as ProductProps["status"],
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Short Description</label>

              <textarea rows={2} value={form.short_description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>

              <textarea rows={5} value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Selling Price</label>

              <input type="number" min={0} value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Cost Price</label>
              <input type="number" min={0} value={form.cost_price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cost_price: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

             <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Offer Price</label>
              <input type="number" min={0} value={form.offer_price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    offer_price: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

          </div>

          {/* Inventory */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Stock</label>
              <input type="number" min={0} value={form.stock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stock: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Low Stock Threshold</label>

              <input type="number" min={0} value={form.low_stock_threshold}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    low_stock_threshold: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
              />
            </div>

          </div>

          {/* Product Flags */}
          <div className="flex flex-wrap gap-6">

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.featured} className="h-4 w-4 rounded border-gray-300 accent-rose-400"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
              />
              Featured
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.best_seller} className="h-4 w-4 rounded border-gray-300 accent-rose-400"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    best_seller: e.target.checked,
                  }))
                }
              />
              Best Seller
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.new_arrival} className="h-4 w-4 rounded border-gray-300 accent-rose-400"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    new_arrival: e.target.checked,
                  }))
                }
              />
              New Arrival
            </label>

          </div>

          {/* SEO */}
          <div className="space-y-4">

            <input placeholder="Meta Title" value={form.meta_title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  meta_title: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
            />

            <textarea rows={3} placeholder="Meta Description" value={form.meta_description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-cream px-4 py-2.5"
            />

          </div>

          {/* Dynamic Sections */}
          <ProductSpecifications
            value={form.specifications ?? []}
            onChange={(specifications) =>
              setForm((prev) => ({ ...prev, specifications }))
            }
          />

          <ProductVariants
            value={form.variants ?? []}
            onChange={(variants) =>
              setForm((prev) => ({ ...prev, variants }))
            }
          />

          <ProductTags
            value={form.tags ?? []}
            onChange={(tags) =>
              setForm((prev) => ({
                ...prev,
                tags,
              }))
            }
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blush-deep py-3 font-semibold text-white"
            >
              {initialProduct ? "Save Changes" : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
