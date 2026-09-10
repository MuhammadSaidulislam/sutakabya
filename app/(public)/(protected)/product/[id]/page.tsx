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
      <section className="mt-10 border-t border-border pt-10">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-ink-900">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            See what our customers think about this product.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Rating Summary */}
          <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
            {/* Average */}
            <div className="flex flex-col items-center justify-center md:border-r md:border-border">
              <span className="text-5xl font-bold text-ink-900">
                {averageRating.toFixed(1)}
              </span>

              <div className="mt-3 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-gray-300"
                    }
                  />
                ))}
              </div>

              <p className="mt-2 text-sm text-ink-400">
                {ratingCount}{" "}
                {ratingCount === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex flex-col justify-center space-y-3">
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
                    {/* Star number */}
                    <div className="flex w-10 shrink-0 items-center gap-1 text-sm text-ink-500">
                      <span>{star}</span>

                      <Star
                        size={13}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    </div>

                    {/* Progress */}
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    {/* Count */}
                    <span className="w-8 text-right text-xs text-ink-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10">
            {reviews.length === 0 ? (
              <div className="mt-6 rounded-xl border border-border p-8 text-center">
                <p className="text-sm text-ink-400">
                  No reviews yet.
                </p>

                <p className="mt-1 text-xs text-ink-300">
                  Be the first to review this product.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {reviews.map((review) => (
                  <div key={review.id} className="py-6">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= Number(review.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    {/* Review */}
                    <p className="mt-3 text-sm leading-6 text-ink-600">
                      {review.review}
                    </p>

                    {/* Date */}
                    <p className="mt-3 text-xs text-ink-400">
                      {new Date(
                        review.created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {page < totalPages && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => fetchReviews(page + 1)}
                  className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
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
