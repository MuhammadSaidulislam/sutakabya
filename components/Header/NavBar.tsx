'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/lib/useHydrated';
import { motion } from 'framer-motion'
import { Category } from '@/types/categories';
import ProductThumb from '../ProductThumb';
import { ProductImage } from '@/types/imageProps';

type SearchProduct = {
  id: number;
  name: string;
  slug?: string;
  images?: ProductImage[];
  price: number;
  sale_price?: number | null;
  category_name?: string;
};

interface NavBarProps {
  isLoggedIn: boolean;
  categories: Category[];
}


export default function NavBar({ isLoggedIn, categories }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const wishlist = useStore((s) => s.wishlist)
  const toggleCart = useStore((s) => s.toggleCart)
  const hydrated = useHydrated();
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDesktop = desktopSearchRef.current?.contains(target);
      const isInsideMobile =  mobileSearchRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // All the product load
  const fetchProducts = useCallback(async () => {

    if (initialLoading) {
      setLoading(true);
    }

    try {
      const res = await fetch(  `/api/admin/product?page=1&limit=4&search=${search}&category=All&status=All`);
      const result = await res.json();

      if (result.success) {
        setSearchProducts(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [search]);

  useEffect(() => {
    startTransition(() => {
      const value = search.trim();
      if (!value) {
        setSearchProducts([]);
        setSearchOpen(false);
        return;
      }
      setSearchOpen(true);
      fetchProducts();
    });
  }, [fetchProducts]);


  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur drop-shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink-light text-brand-pink">
            <Heart size={18} fill="currentColor" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-brand-ink sm:text-xl">
              Kids &amp; Mom
            </span>
            <span className="hidden text-[10px] tracking-wide text-brand-muted sm:block">
              For the love of little ones
            </span>
          </span>
        </Link>

        {/* Search - desktop/tablet */}
        <div ref={desktopSearchRef} className="relative hidden flex-1 md:flex max-w-xl" >
          <div className="flex w-full items-center rounded-full border border-brand-pink bg-white py-1.5 pl-5 pr-1.5 shadow-sm transition-all focus-within:border-brand-pink focus-within:shadow-[0_4px_20px_rgba(232,160,181,0.15)]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (search.trim()) {
                  setSearchOpen(true);
                }
              }}
              placeholder="Search products...."
              className="w-full border-none bg-transparent text-sm text-brand-ink placeholder:text-brand-muted !outline-none focus-visible:!outline-none !outline-offset-0"
            />

            {search && (
              <button type="button"
                onClick={() => {
                  setSearch("");
                  setSearchProducts([]);
                  setSearchOpen(false);
                }} className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-pink-light hover:text-brand-pink">
                <X size={14} />
              </button>
            )}

            <button type="button" aria-label="Search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition hover:bg-brand-rose">
              <Search size={15} />
            </button>
          </div>

          {/* Search results */}
          {searchOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-9999  rounded-2xl bg-white shadow-[0_15px_45px_rgba(0,0,0,0.12)]">

              {/* Loading */}
              {searchLoading && (
                <div className="px-5 py-6 text-center">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand-pink-soft border-t-brand-pink" />
                  <p className="mt-2 text-xs text-brand-muted">
                    Finding products...
                  </p>
                </div>
              )}

              {/* Results */}
              {!searchLoading && searchProducts.length > 0 && (
                <div>
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {searchProducts.map((product) => {
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => { setSearchOpen(false); setSearch("") }}
                          className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-brand-pink-light/50"
                        >
                          {/* Image */}
                          <div className="relative shrink-0 overflow-hidden rounded-xl bg-brand-pink-light">
                            <ProductThumb image={product.images} />
                          </div>

                          {/* Product info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-brand-ink">
                              {product.name}
                            </p>

                            {product.category_name && (
                              <p className="mt-0.5 truncate text-xs text-brand-muted">
                                {product.category_name}
                              </p>
                            )}

                          </div>
                          <div className="">

                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-bold text-brand-pink">
                                ৳{product.price}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results */}
              {!searchLoading && search.trim() && searchProducts.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink-light">
                    <Search
                      size={20}
                      className="text-brand-pink"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-brand-ink">
                    No products found
                  </p>

                  <p className="mt-1 text-xs text-brand-muted">
                    Try searching for another product or category.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Utility icons */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href={isLoggedIn ? "/account" : "/login"} className="relative items-center gap-1.5 text-sm text-brand-ink hover:text-brand-pink sm:flex">
            <Heart size={19} />
            {wishlist.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[10px] text-white"
              >
                {wishlist.length}
              </motion.span>
            )}
            <span className="hidden lg:inline">Wishlist</span>
          </Link>
          <Link href={isLoggedIn ? "/account" : "/login"} className="relative items-center gap-1.5 text-sm text-brand-ink hover:text-brand-pink sm:flex">
            <User size={19} />
            <span className="hidden lg:inline">Account</span>
          </Link>
          <button onClick={toggleCart} className="relative flex items-center gap-1.5 text-sm text-brand-ink hover:text-brand-pink">
            <ShoppingBag size={19} />
            {hydrated && cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[10px] text-white"
              >
                {cartCount}
              </motion.span>
            )}
            <span className="hidden lg:inline">Cart</span>
          </button>
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-brand-pink-soft text-brand-ink lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div ref={mobileSearchRef} className="px-4 pb-3 md:hidden">
        <div className="flex w-full items-center rounded-full border border-brand-pink bg-white py-1.5 pl-5 pr-1.5 shadow-sm transition-all focus-within:border-brand-pink focus-within:shadow-[0_4px_20px_rgba(232,160,181,0.15)]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (search.trim()) {
                setSearchOpen(true);
              }
            }}
            placeholder="Search products...."
            className="w-full border-none bg-transparent text-sm text-brand-ink placeholder:text-brand-muted !outline-none focus-visible:!outline-none !outline-offset-0"
          />

          {search && (
            <button type="button"
              onClick={() => {
                setSearch("");
                setSearchProducts([]);
                setSearchOpen(false);
              }} className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-pink-light hover:text-brand-pink">
              <X size={14} />
            </button>
          )}

          <button type="button" aria-label="Search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition hover:bg-brand-rose">
            <Search size={15} />
          </button>
        </div>

        {/* Search results */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-[100] overflow-hidden rounded-2xl bg-white shadow-[0_15px_45px_rgba(0,0,0,0.12)]">

            {/* Loading */}
            {searchLoading && (
              <div className="px-5 py-6 text-center">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand-pink-soft border-t-brand-pink" />
                <p className="mt-2 text-xs text-brand-muted">
                  Finding products...
                </p>
              </div>
            )}

            {/* Results */}
            {!searchLoading && searchProducts.length > 0 && (
              <div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {searchProducts.map((product) => {
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => { setSearchOpen(false); setSearch("") }}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-brand-pink-light/50"
                      >
                        {/* Image */}
                        <div className="relative shrink-0 overflow-hidden rounded-xl bg-brand-pink-light">
                          <ProductThumb image={product.images} />
                        </div>

                        {/* Product info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-ink">
                            {product.name}
                          </p>

                          {product.category_name && (
                            <p className="mt-0.5 truncate text-xs text-brand-muted">
                              {product.category_name}
                            </p>
                          )}

                        </div>
                        <div className="">

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-brand-pink">
                              ৳{product.price}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {!searchLoading && search.trim() && searchProducts.length === 0 && (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink-light">
                  <Search
                    size={20}
                    className="text-brand-pink"
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-brand-ink">
                  No products found
                </p>

                <p className="mt-1 text-xs text-brand-muted">
                  Try searching for another product or category.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
          {categories.map((category) => (
            <div key={category.id} className="group relative">
              {/* Category */}
              <Link
                href={`/shop?category=${category.slug}`}
                className="flex items-center gap-1.5 py-4 text-[13px] font-semibold tracking-wide text-brand-ink transition-colors duration-200 hover:text-brand-pink"
              >
                {category.name}

                {category.subCategories?.length > 0 && (
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </Link>

              {/* Luxury Mega Menu */}
              {category.subCategories?.length > 0 && (
                <div className="invisible absolute left-1/2 top-full z-50 w-auto min-w-[220px] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_25px_70px_rgba(0,0,0,0.12)]">

                    {/* Top luxury accent */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-pink to-transparent" />

                    {/* Subcategories */}
                    <div className="flex flex-col p-5">
                      {category.subCategories.map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={`/shop?category=${category.slug}&subCategory=${subCategory.slug}`}
                          className="group/item flex items-center whitespace-nowrap py-3 text-[13px] font-medium text-gray-600 transition-all duration-200 hover:translate-x-1 hover:text-brand-pink"
                        >
                          {/* Elegant dot */}
                          <span className="mr-3 h-1 w-1 shrink-0 rounded-full bg-gray-300 transition-all duration-200 group-hover/item:scale-150 group-hover/item:bg-brand-pink" />

                          <span>{subCategory.name}</span>

                          {/* Arrow */}
                          <svg
                            className="ml-auto h-3 w-3 -translate-x-2 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 010-1.06L10.92 10 7.21 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* All Products */}
          <Link
            href="/shop"
            className="flex items-center gap-2 py-4 text-[13px] font-semibold tracking-wide text-brand-teal transition hover:text-brand-pink"
          >
            All Products

            <span className="rounded-full bg-brand-pink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Hot
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full z-50 rounded-b-2xl border-t border-black/[0.05] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.10)] lg:hidden">
          <div className="max-h-[80vh] overflow-y-auto px-4 py-4">

            {categories.map((category) => (
              <div
                key={category.id}
                className="border-b border-black/[0.05] last:border-0"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="flex-1 py-4 text-[14px] font-semibold tracking-wide text-brand-ink"
                  >
                    {category.name}
                  </Link>

                  {category.subCategories?.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCategory(
                          openCategory === category.id ? null : category.id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-brand-pink-light"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-300 ${openCategory === category.id ? "rotate-180" : ""
                          }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.06-.02l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                <div
                  className={`grid transition-all duration-300 ${openCategory === category.id
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="mb-3 ml-2 border-l border-brand-pink/20 pl-4">
                      {category.subCategories.map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={`/shop?category=${category.slug}&subCategory=${subCategory.slug}`}
                          className="block py-2.5 text-[13px] text-gray-500 transition hover:translate-x-1 hover:text-brand-pink"
                        >
                          {subCategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* All Products */}
            <Link
              href="/shop"
              className="mt-3 flex items-center justify-between rounded-xl bg-brand-teal/[0.06] px-4 py-3.5 text-[13px] font-semibold text-brand-teal"
            >
              <span>All Products</span>

              <span className="rounded-full bg-brand-pink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Hot
              </span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
