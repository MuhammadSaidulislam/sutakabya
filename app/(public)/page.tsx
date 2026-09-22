"use client"
import Link from 'next/link'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { ProductProps } from '@/types/product'
import { useSearchParams } from 'next/navigation'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { CustomLeftArrow, CustomRightArrow } from '@/components/Arrow'
import Features from '@/components/Features'
import FlashSale from '@/components/FlashSale'
import Reveal from '@/components/Reveal'


const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1280 },
    items: 6,
  },
  laptop: {
    breakpoint: { max: 1280, min: 1024 },
    items: 6,
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
  },
};

// Adjust this to match whatever your /api/admin/categories route actually returns
type CategoryProps = {
  id: string;
  name: string;
  slug: string;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const presetFilter = searchParams.get("filter");

  // Bestsellers / main product list
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductProps[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<ProductProps[]>([]);
  console.log("bestSellingProducts", bestSellingProducts);
  console.log("newArrivalProducts", newArrivalProducts);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(presetFilter ?? "All");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  // Category-wise data
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductProps[]>>({});

  // Fetch main product list (bestsellers section)
  const fetchProducts = useCallback(async () => {
    if (initialLoading) {
      setLoading(true);
    }

    const start = Date.now();

    try {
      const res = await fetch(`/api/admin/product?page=${page}&limit=${limit}`);
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
  }, [page, limit, categoryFilter, statusFilter]);

  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [fetchProducts]);

  const fetchHomeProducts = useCallback(async () => {
    try {
      const [bestSellingRes, newArrivalRes] = await Promise.all([
        fetch('/api/admin/product?collection=best-seller&limit=10'),
        fetch('/api/admin/product?collection=new-arrival&limit=10'),
      ]);

      const [bestSellingResult, newArrivalResult] = await Promise.all([
        bestSellingRes.json(),
        newArrivalRes.json(),
      ]);

      if (bestSellingResult.success) {
        setBestSellingProducts(bestSellingResult.data);
      }

      if (newArrivalResult.success) {
        setNewArrivalProducts(newArrivalResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch home products:', error);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchHomeProducts();
    });
  }, [fetchHomeProducts]);

  // Fetch category list
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories?page=1&limit=20`);
      const result = await res.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchCategories();
    });
  }, [fetchCategories]);


  // Once categories are loaded, fetch products for each category in parallel
  useEffect(() => {
    if (categories.length === 0) return;

    const fetchAllCategoryProducts = async () => {
      const entries = await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(`/api/admin/product?category=${cat.slug}&limit=10`);
            const result = await res.json();
            return [cat.slug, result.success ? result.data : []] as const;
          } catch (error) {
            console.error(error);
            return [cat.slug, []] as const;
          }
        })
      );
      setCategoryProducts(Object.fromEntries(entries));
    };

    fetchAllCategoryProducts();
  }, [categories]);

  return (
    <>
      <Hero />
      <Features />
      <FlashSale />
      {/* Best Sellers */}
      {bestSellingProducts.length > 0 && <section className="relative overflow-hidden bg-[#fff8f8] py-14 sm:py-20">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-red-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {/* Section Header */}
          <div className="mb-10 text-center sm:mb-12">
            {/* Eyebrow */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-400 sm:w-12" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-500 sm:text-xs">
                Loved by our customers
              </span>

              <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-400 sm:w-12" />
            </div>

            {/* Main Heading */}
            <div className="flex items-center justify-center gap-3">
              <span className="hidden text-rose-300 sm:block">✦</span>

              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">Best Selling Products</h2>

              <span className="hidden text-rose-300 sm:block">✦</span>
            </div>


            {/* Shop All */}
            <div className="mt-5">
              <Link
                href="/collection?collection=best-seller"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 transition-colors hover:text-rose-800"
              >
                Shop Best Selling
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Products */}
          <div className="relative">
            <Carousel
              responsive={responsive}
              customLeftArrow={<CustomLeftArrow />}
              customRightArrow={<CustomRightArrow />}
              infinite
              keyBoardControl
              itemClass="px-2 sm:px-3"
              containerClass="-mx-2 sm:-mx-3"
            >
              {bestSellingProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                />
              ))}
            </Carousel>
          </div>

        </div>
      </section>}

      {/* Category-wise sections (Shoe, Skincare, Assets, Diapers, ...) */}
      {categories && categories.map((cat) => {
        const catProducts = categoryProducts[cat.slug] || [];
        if (catProducts.length === 0) return null;

        return (
          <section key={cat.id} className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
            {/* Section Header */}
            <div className="mb-7 flex items-end justify-between pb-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-px w-7 bg-[#c98b8b]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b47777]">
                    Curated Collection
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-[#262323] sm:text-3xl">
                    {cat.name}
                  </h2>

                  <span className="hidden text-xs text-neutral-400 sm:inline">
                    {catProducts.length} pieces
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-neutral-500">
                  Thoughtfully chosen styles for little moments.
                </p>
              </div>

              {/* View All */}
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group mb-1 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#393333] sm:flex"
              >
                <span className="border-b border-[#393333] pb-1 transition-all duration-300 group-hover:border-[#c98b8b] group-hover:text-[#b47777]">
                  View All
                </span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            {/* Mobile View All */}
            <div className="mb-5 flex items-center justify-between sm:hidden">
              <span className="text-xs text-neutral-400">
                {catProducts.length} products
              </span>

              <Link
                href={`/shop?category=${cat.slug}`}
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b47777]"
              >
                View All →
              </Link>
            </div>

            {/* Products */}
            <div className="-mx-2">
              <Carousel
                responsive={responsive}
                customLeftArrow={<CustomLeftArrow />}
                customRightArrow={<CustomRightArrow />}
                infinite
                keyBoardControl
                itemClass="px-2"
                containerClass="pb-2"
              >
                {catProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={i}
                  />
                ))}
              </Carousel>
            </div>
          </section>
        );
      })}

      {/* New Arrivals */}
      {newArrivalProducts.length &&
        <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Reveal direction="scale">
            <div className="relative overflow-hidden rounded-3xl bg-[#fff8f8] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
              {/* Decorative background */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-200/20 blur-3xl" />

              {/* Header */}
              <div className="relative mb-7 flex items-end justify-between  pb-5">
                <div>
                  {/* Eyebrow */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px w-7 bg-[#c98b8b]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b47777]">
                      Just Arrived
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-[#262323] sm:text-3xl lg:text-[34px]">
                    New Arrivals
                  </h2>

                  {/* Description */}
                  <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
                    Fresh styles, thoughtfully chosen for every little moment.
                  </p>
                </div>

                {/* Desktop View All */}
                <Link
                  href="/collection?collection=new-arrival"
                  className="group mb-1 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#393333] sm:flex"
                >
                  <span className="border-b border-[#393333] pb-1 transition-all duration-300 group-hover:border-[#b47777] group-hover:text-[#b47777]">
                    View All
                  </span>

                  <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              {/* Product Grid */}
              <div className="relative">
                <Carousel
                  responsive={responsive}
                  customLeftArrow={<CustomLeftArrow />}
                  customRightArrow={<CustomRightArrow />}
                  infinite
                  keyBoardControl
                  itemClass="px-2"
                  containerClass="pb-2"
                >
                  {newArrivalProducts.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={i}
                    />
                  ))}
                </Carousel>
              </div>

              {/* Mobile View All */}
              <div className="mt-7 flex justify-center sm:hidden">
                <Link
                  href="/collection?collection=new-arrival"
                  className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#393333]"
                >
                  <span className="border-b border-[#393333] pb-1 transition-all duration-300 group-hover:border-[#b47777] group-hover:text-[#b47777]">
                    View All New Arrivals
                  </span>

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      }


    </>
  )
}