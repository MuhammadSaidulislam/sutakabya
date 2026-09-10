"use client"
import Link from 'next/link'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import EventShowcase from '@/components/EventShowcase'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { ProductProps } from '@/types/product'
import { useSearchParams } from 'next/navigation'
import Categories from '@/components/Categories'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { CustomLeftArrow, CustomRightArrow } from '@/components/Arrow'
import Features from '@/components/Features'
import FlashSale from '@/components/FlashSale'
import CouponBanner from '@/components/CouponBanner'

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1280 },
    items: 5,
  },
  laptop: {
    breakpoint: { max: 1280, min: 1024 },
    items: 5,
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
  const [search, setSearch] = useState("");
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
      const res = await fetch(`/api/admin/product?page=${page}&limit=${limit}&search=${search}&category=${categoryFilter}&status=${statusFilter}`);
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
  }, [page, limit, search, categoryFilter, statusFilter]);

  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [fetchProducts]);

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
      <FlashSale products={products} />
      {/* <Categories /> */}
      {/* <CouponBanner /> */}

      {/* Bestsellers */}
      {/* <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <div className="flex items-center justify-center flex-col  mb-8">
          <p className="font-serif text-3xl sm:text-4xl text-ink-900">Browse By</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-[2px] w-10 bg-gradient-to-r from-red-500 to-transparent" />
            <span className="whitespace-nowrap  text-xl sm:text-3xl  font-semibold uppercase tracking-[0.1em] text-rose-danger">
              Curated Collections
            </span>
            <div className="h-[2px] w-10 bg-gradient-to-l from-red-500 to-transparent" />
          </div>
          <div>
            <p className="text-coral-500 text-xs tracking-[0.2em] uppercase mb-2 mt-3"> Discover the latest trends with our handpicked luxury selections.</p>
          </div>
        </div>

        <Carousel
          responsive={responsive}
          customLeftArrow={<CustomLeftArrow />}
          customRightArrow={<CustomRightArrow />}
          infinite
          keyBoardControl
          itemClass="px-2"
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
            />
          ))}
        </Carousel>
      </section> */}

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

      <EventShowcase />
    </>
  )
}