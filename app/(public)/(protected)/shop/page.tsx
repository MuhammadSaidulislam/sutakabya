'use client'

import { useState, Suspense, useTransition, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import FilterSidebar from '@/components/FilterSidebar'
import ProductCard from '@/components/ProductCard'
// import { products } from '@/data/products'
import { Color, Filters, ProductProps, ProductVariant, Size } from '@/types/product'
import { Category } from '@/types/categories'


function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const subCategoryParam = searchParams.get("subCategory") ?? "";
  const categories = useMemo(() => categoryParam.split(",").filter(Boolean), [categoryParam]);
  const subCategories = useMemo(() => subCategoryParam.split(",").filter(Boolean), [subCategoryParam]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    minPrice: 0,
    maxPrice: 0,
  });

  const [filters, setFilters] = useState<Filters>({
    size: [],
    color: [],
    selectedPrice: priceRange.maxPrice,
    sort: "newest",
  });




  //   const searchParams = useSearchParams();
  const presetFilter = searchParams.get("filter");
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [colorFilter, setColorFilter] = useState<Color[]>([]);
  const [sizeFilter, setSizeFilter] = useState<Size[]>([]);
  const [statusFilter, setStatusFilter] = useState(presetFilter ?? "All");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");



  // All the product load
  const fetchProducts = useCallback(async () => {
    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        status: statusFilter,
        maxPrice: String(filters.selectedPrice),
        sort: filters.sort,
      });

      if (categories.length) {
        params.set("category", categories.join(","));
      }

      if (subCategories.length) {
        params.set("subCategory", subCategories.join(","));
      }

      if (filters.size.length) {
        params.set("size", filters.size.join(","));
      }

      if (filters.color.length) {
        params.set("color", filters.color.join(","));
      }

      const res = await fetch(`/api/admin/product?${params.toString()}`);

      const result = await res.json();

      if (result.success) {
        setProducts(result.data);

        setPriceRange((prev) => {
          if (
            prev.minPrice === result.filters.priceRange.min &&
            prev.maxPrice === result.filters.priceRange.max
          ) {
            return prev;
          }

          return {
            ...prev,
            minPrice: result.filters.priceRange.min,
            maxPrice: result.filters.priceRange.max
          };
        });
        setColorFilter(result.filters.colors);
        setSizeFilter(result.filters.sizes);
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
  }, [page, limit, search, statusFilter, filters, categoryParam, subCategoryParam]);



  // All category list
  const fetchCategories = useCallback(async () => {

    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const res = await fetch(`/api/admin/categories?page=${page}&limit=${limit}&search=${search}`);

      const result = await res.json();

      if (result.success) {
        setCategory(result.data);
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
  }, [page, limit, search]);
  // category list
  useEffect(() => {
    startTransition(() => {
      fetchProducts();
      fetchCategories();
    });
  }, [fetchProducts, fetchCategories]);


  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <div className="mb-8">
        <p className="text-blush-500 text-xs tracking-[0.2em] uppercase mb-2">All Products</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-900">Shop the Collection</h1>
      </div>

      <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden flex items-center gap-2 mb-6 px-4 py-2.5 rounded-full border border-ink-200 text-sm"  >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0 bg-white rounded-xl p-6 border border-gray-200">
          <FilterSidebar priceRange={priceRange} colorFilter={colorFilter} sizeFilter={sizeFilter} filters={filters} setFilters={setFilters} products={products} categories={category} />
        </aside>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-ink-900/40 z-50 lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 h-full w-80 bg-cream-50 z-50 p-6 overflow-y-auto lg:hidden bg-white"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-xl">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
                </div>
                <FilterSidebar priceRange={priceRange} colorFilter={colorFilter} sizeFilter={sizeFilter} filters={filters} setFilters={setFilters} products={products} categories={category} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>

          <motion.div layout className="w-full">
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-2 border border-gray-200">
                      <p className="text-ink-400 text-sm mt-2">{products.length} Items</p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as Filters["sort"] }))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none transition"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="top-viewed">Most Viewed</option>
              </select>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
            {products.length === 0 && (
              <p className="col-span-full text-center text-ink-400 py-16">No products match your filters.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-ink-400">Loading...</div>}>
      <ShopContent />
    </Suspense>
  )
}
