"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Trash2, PackageSearch } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";
import ProductModal from "@/components/ProductModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProductThumb from "@/components/ProductThumb";
import { ProductProps } from "@/types/product";
import { Category, SubCategory } from "@/types/categories";
import { TablePage } from "@/components/TablePage";
import { toast } from "@/lib/toast";
import { PRODUCT_STATUS } from "@/lib/enum";


export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const presetFilter = searchParams.get("filter");

  const [products, setProducts] = useState<ProductProps[]>([]);
  // console.log("products", products);
  const [search, setSearch] = useState("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(presetFilter ?? "All");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductProps | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductProps | null>(null);

  // All the categories load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "/api/admin/categories?page=1&limit=100"
        );

        const result = await res.json();

        if (result.success) {
          setCategoryList(result.data);
        //  setSubCategories(result.data.subCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);
  // All the product load
  const fetchProducts = useCallback(async () => {

    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const res = await fetch(
        `/api/admin/product?page=${page}&limit=${limit}&search=${search}&category=${categoryFilter}&status=${statusFilter}`
      );

      const result = await res.json();

      if (result.success) {
        setProducts(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
        setInitialLoading(false);
      }, delay);
    }
  }, [page, limit, search, categoryFilter, statusFilter, modalOpen]);
  // category list
  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [fetchProducts]);

  // delete product
  const handleDelete = async () => {

    try {
      const res = await fetch(`/api/admin/product?id=${deleteTarget?.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          message: result.message || "Failed to save product.",
          position: "top-right",
          type: "error",
        });
        return;
      }

      // Refresh product list
      fetchProducts();
      setDeleteTarget(null);
      toast({
        message: result.message || "Deleted product.",
        position: "top-right",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        message: "Something went wrong.",
        position: "top-right",
        type: "error",
      });
    }
  };


  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products across ${categoryList.length} categories`}
        action={
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blush-deep px-4 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
          >
            <Plus size={17} />
            Add product
          </button>
        }
      />
      {/* Product filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU…"
            className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink sm:w-56"
        >
          <option value="All">All categories</option>
          {categoryList.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink sm:w-44"
        >
          <option value="All">All statuses</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      {/* table method */}

      <TablePage title="Products" subtitle={`${products.length} products across ${categoryList.length} categories`} addLabel="Add Product"
        headers={["ID", "Product", "Category", "Sell Price", "Cost Price", "Stock", "Status", "Actions"]}
        page={page}
        onAddClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        setSearch={setSearch}
        search={search}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        rows={products.map(product => (
          <tr key={product.id} className="border-t border-border">
            <td className="px-5 py-3 text-ink-soft">{product.id}</td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <ProductThumb image={product.images} />
                <div>
                  <p className="font-medium text-ink">{product.name}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3 text-ink-soft">{product.category_name}</td>
            <td className="px-5 py-3 text-ink-soft">{product.price}</td>
              <td className="px-5 py-3 text-ink-soft">{product.cost_price}</td>
            <td className="px-5 py-3 text-ink-soft">{product.stock}</td>
            <td className="px-5 py-3">
              <StatusPill status={PRODUCT_STATUS.find((item) => item.value === product.status)?.label ?? product.status} />
            </td>
            <td className="px-5 py-3 w-px whitespace-nowrap">
              <div className="flex justify-end gap-1.5">
                <button
                  aria-label={`Edit ${product.name}`}
                  onClick={() => {
                    setEditing(product);
                    setModalOpen(true);
                  }}
                  className="rounded-lg p-2 text-ink-soft hover:bg-cream-deep hover:text-ink"
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={`Delete ${product.name}`}
                  onClick={() => setDeleteTarget(product)}
                  className="rounded-lg p-2 text-ink-soft hover:bg-rose-danger/10 hover:text-rose-danger"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      />


      {modalOpen && <ProductModal
        key={`${editing?.id ?? "new"}-${modalOpen}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categoryList}
        initialProduct={editing}
      />}


      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed from your catalog.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
