"use client"
import { startTransition, useEffect, useState } from "react";
import { notFound, useParams } from 'next/navigation'
import { ProductProps } from "@/types/product";
import ProductGallery from "@/components/ProductGallery";
import ProductConfigurator from "@/components/ProductConfigurator";
import { Star } from "lucide-react";



interface Review {
   id: number;
  product_id: number;
  user_id: number;
  customer_name: string;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
}

interface ReviewSummary {
  average_rating: number;
  rating_count: number;
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewsResponse {
  success: boolean;
  data: {
    summary: ReviewSummary;
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}




async function getProduct(id: string): Promise<ProductProps | null> {
  const res = await fetch(`/api/admin/product/${id}`);

  if (!res.ok) return null;

  const result = await res.json();
  return result.data;
}


export default function Page({ params }: { params: { id: string } }) {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundProduct, setNotFoundProduct] = useState(false);
 const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(id);

        if (!data) {
          setNotFoundProduct(true);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error(error);
        setNotFoundProduct(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);


  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(
        `/api/admin/product/${id}/reviews?page=${pageNumber}&limit=10`
      );

      const result: ReviewsResponse = await res.json();

      if (!result.success) {
        throw new Error("Failed to fetch reviews");
      }

      setSummary(result.data.summary);
      setTotalPages(result.data.pagination.totalPages);
      setPage(result.data.pagination.page);

      if (pageNumber === 1) {
        setReviews(result.data.reviews);
      } else {
        setReviews((prev) => [...prev, ...result.data.reviews]);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

    useEffect(() => {
      startTransition(() => {
       fetchReviews(1);
      });
    }, [id]);


  if (loading) {
    return (
      <div className="mt-10 border-t border-border pt-10">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />

        <div className="mt-6 h-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const averageRating = Number(summary?.average_rating || 0);
  const ratingCount = Number(summary?.rating_count || 0);


  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product?.images} name={product?.name} />
        {product && <ProductConfigurator product={product} />}
      </div>


      {/* Customer Reviews */}
       <section className="mt-4 border-border rounded-xl pt-12 sm:pt-16 bg-white">
        <div className="border-b border-border">
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <button type="button" onClick={() => setActiveTab("description")} className={`relative pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${activeTab === "description" ? "text-ink-900" : "text-ink-400 hover:text-ink-700"}`} > Description
              {activeTab === "description" && (<span className="absolute bottom-[-1px] left-0 h-px w-full bg-brand-pink" />)}
            </button>
            <button type="button" onClick={() => setActiveTab("reviews")} className={`relative flex items-center gap-2 pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${activeTab === "reviews" ? "text-ink-900" : "text-ink-400 hover:text-ink-700"}`} > Reviews <span className={activeTab === "reviews" ? "text-[10px] text-brand-pink" : "text-[10px] text-ink-400"} > ({ratingCount}) </span>
              {activeTab === "reviews" && (<span className="absolute bottom-[-1px] left-0 h-px w-full bg-brand-pink" />)}
            </button>
          </div>
        </div>
        <div className="mt-10 pb-10 px-5"> {activeTab === "description" && (<div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-pink"> Product Story </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl"> Designed with intention </h2>
          </div>
          <div className="prose descriptionBox prose-sm mt-8 max-w-none text-ink-600 prose-headings:text-ink-900 prose-p:leading-7 prose-strong:text-ink-900 prose-a:text-brand-pink" dangerouslySetInnerHTML={{ __html: product?.description || "", }} /> </div>
        )}
          {activeTab === "reviews" && (
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-10">
                {/*   RATING SUMMARY */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 sm:p-8 lg:sticky lg:top-24">
                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-pink/5 blur-3xl" />

                  <div className="relative">
                    {/* Overall Rating */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                        Overall Rating
                      </span>

                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-6xl font-semibold tracking-tight text-ink-900">
                          {averageRating.toFixed(1)}
                        </span>

                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={15}
                                strokeWidth={1.5}
                                className={
                                  star <= Math.round(averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent text-gray-300"
                                }
                              />
                            ))}
                          </div>

                          <span className="mt-1 text-xs text-ink-400">
                            {ratingCount}{" "}
                            {ratingCount === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-7 h-px bg-border" />

                    {/* Rating Breakdown */}
                    <div className="space-y-3.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count =
                          summary?.ratings[
                          star as keyof ReviewSummary["ratings"]
                          ] || 0;

                        const percentage =
                          ratingCount > 0
                            ? (count / ratingCount) * 100
                            : 0;

                        return (
                          <div
                            key={star}
                            className="flex items-center gap-3"
                          >
                            <div className="flex w-9 shrink-0 items-center gap-1.5">
                              <span className="text-xs font-medium text-ink-500">
                                {star}
                              </span>

                              <Star
                                size={12}
                                strokeWidth={1.5}
                                className="fill-yellow-400 text-yellow-400"
                              />
                            </div>

                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-yellow-400 transition-all duration-700"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <span className="w-6 text-right text-[11px] text-ink-400">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/*  REVIEWS */}
                <div className="overflow-hidden rounded-2xl border border-border bg-white">
                  {/* Reviews Header */}
                  <div className="flex items-end justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900">
                        Customer Reviews
                      </h3>

                      <p className="mt-1 text-xs text-ink-400">
                        Real experiences from our customers
                      </p>
                    </div>

                    {ratingCount > 0 && (
                      <span className="shrink-0 rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
                        {ratingCount}{" "}
                        {ratingCount === 1 ? "Review" : "Reviews"}
                      </span>
                    )}
                  </div>

                  {/* Scrollable Reviews */}
                  {reviews.length === 0 ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-14 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Star
                          size={20}
                          strokeWidth={1.5}
                          className="text-gray-300"
                        />
                      </div>

                      <p className="mt-4 text-sm font-medium text-ink-700">
                        No reviews yet
                      </p>

                      <p className="mt-1 max-w-xs text-xs leading-5 text-ink-400">
                        Be the first to share your experience with this product.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[620px] overflow-y-auto px-6 sm:px-8">
                        <div className="divide-y divide-border">
                          {reviews.map((review) => (
                            <article
                              key={review.id}
                              className="py-6 first:pt-7"
                            >
                              {/* Top */}
                              <div className="flex items-center justify-between gap-4">
                                {/* Stars */}
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      strokeWidth={1.5}
                                      className={
                                        star <= Number(review.rating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-transparent text-gray-300"
                                      }
                                    />
                                  ))}
                                </div>

                                {/* Date */}
                                <time className="text-[10px] text-ink-400">
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </time>
                              </div>

                              {/* Review */}
                              <p className="mt-3 text-sm leading-7 text-ink-600">
                                “{review.review}”
                              </p>

                              {/* Customer */}
                              <div className="mt-4 flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-pink/10 text-[10px] font-semibold text-brand-pink">
                                  {review.customer_name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </span>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-ink-700">
                                    {review.customer_name}
                                  </span>

                                  <span className="h-1 w-1 rounded-full bg-gray-300" />

                                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-400">
                                    Verified Customer
                                  </span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>

                      {/* Load More */}
                      {page < totalPages && (
                        <div className="border-t border-border px-6 py-5 text-center sm:px-8">
                          <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() => fetchReviews(page + 1)}
                            className="group inline-flex items-center gap-2 rounded-full border border-ink-900 px-6 py-2.5 text-xs font-medium text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loadingMore ? (
                              "Loading..."
                            ) : (
                              <>
                                Load More Reviews

                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                  →
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* {relatedProducts.length > 0 && (
                <section className="mt-20">
                    <h2 className="font-serif text-2xl sm:text-3xl text-ink-900 mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
                        {relatedProducts.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </section>
            )} */}
    </div>
  )
}
