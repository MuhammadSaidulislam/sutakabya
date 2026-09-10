"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageSquareOff,
  Loader2,
  Search,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";

interface Review {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image: string | null;

  user_id: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;

  order_id: number;
  order_no: string;

  rating: number;
  review: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ReviewApiResponse {
  success: boolean;
  data: Review[];
  pagination: Pagination;
  message?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating ? "text-honey-deep" : "text-border"
          }
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 12;

  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  /*
   * =========================
   * Fetch Reviews
   * =========================
   */

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      // Search
      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      // Status
      if (statusFilter !== "All") {
        params.set("status", statusFilter);
      }

      // Rating
      if (ratingFilter !== "All") {
        params.set("rating", ratingFilter);
      }

      const response = await fetch(
        `/api/admin/review?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: ReviewApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load reviews"
        );
      }

      setReviews(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      console.error(
        "Fetch reviews error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews"
      );

      setReviews([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    statusFilter,
    ratingFilter,
  ]);

  useEffect(() => {
    startTransition(() => {
      fetchReviews();
    });
  }, [fetchReviews]);


  /*
   * =========================
   * Change Review Status
   * =========================
   */

  const setStatus = async (
    id: number,
    status: Review["status"]
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/review/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update review"
        );
      }

      /*
       * Update UI immediately
       */
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
              ...review,
              status,
            }
            : review
        )
      );
    } catch (err) {
      console.error("Update review error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update review"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * =========================
   * Statistics
   * =========================
   *
   * These are based on the currently loaded page.
   *
   * If your API returns global statistics,
   * use those instead.
   */

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;

    return (
      reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0
      ) / reviews.length
    );
  }, [reviews]);

  const pendingCount = useMemo(() => {
    return reviews.filter(
      (review) => review.status === "PENDING"
    ).length;
  }, [reviews]);

  /*
   * =========================
   * Render
   * =========================
   */

  return (
    <div>
      <PageHeader
        title="Product reviews"
        description={
          pagination
            ? `${pagination.total} reviews • ${avgRating.toFixed(
              1
            )} average rating • ${pendingCount} awaiting moderation`
            : "Manage customer product reviews"
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search product, SKU or customer..."
            className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-3.5 text-[13.5px] text-ink outline-none placeholder:text-ink-soft focus:border-honey-deep"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink outline-none sm:w-48"
        >
          <option value="All">All statuses</option>
          <option value="APPROVED">Published</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Hidden</option>
        </select>

        {/* Rating */}
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink outline-none sm:w-44"
        >
          <option value="All">All ratings</option>

          {[5, 4, 3, 2, 1].map((rating) => (
            <option
              key={rating}
              value={rating}
            >
              {rating} star{rating !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-rose-danger/20 bg-rose-danger/5 px-4 py-3 text-sm text-rose-danger">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading reviews...
          </div>
        </div>
      ) : (
        <>
          {/* Reviews */}
          <div className="mt-4 flex flex-col gap-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left */}
                  <div className="flex min-w-0 gap-4">
                    {/* Product Image */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-cream">
                      {review.product_image ? (
                        <img
                          src={review.product_image}
                          alt={review.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-ink-soft">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product + Customer */}
                    <div className="min-w-0">
                      <p className="font-display text-[14.5px] font-semibold text-ink">
                        {review.product_name}  {review.status !== "APPROVED" && (
                          <span className="text-rose-danger">
                            (Not Approved)
                          </span>
                        )}
                      </p>

                      <p className="mt-0.5 text-[12px] text-ink-soft">
                        SKU: {review.product_sku}
                      </p>

                      <p className="mt-1 text-[12.5px] text-ink-soft">
                        {review.customer_name}

                        {review.customer_phone && (
                          <>
                            {" "}
                            • {review.customer_phone}
                          </>
                        )}

                        {review.customer_email && (
                          <>
                            {" "}
                            • {review.customer_email}
                          </>
                        )}
                      </p>

                      <p className="mt-1 text-[11.5px] text-ink-soft">
                        Order: {review.order_no} •{" "}
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Rating + Status */}
                  <div className="flex items-center gap-3">
                    <Stars
                      rating={Number(review.rating)}
                    />
                    {review.rating}
                  </div>
                </div>

                {/* Review */}
                <div className="mt-4 rounded-xl bg-cream/70 p-4">
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">
                    {review.review}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {/* Pending */}
                  {(review.status === "REJECTED" || review.status === "PENDING") &&  (
                    <button
                      disabled={updatingId === review.id}
                      onClick={() =>
                        setStatus(
                          review.id,
                          "APPROVED"
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-honey-deep transition hover:bg-honey/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === review.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Eye size={14} />
                      )}

                      Mark approved
                    </button>
                  )}

                  {/* Hide */}
                  {review.status === "APPROVED" && (
                    <button
                      disabled={updatingId === review.id}
                      onClick={() =>
                        setStatus(
                          review.id,
                          "REJECTED"
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-rose-danger transition hover:bg-rose-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === review.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <EyeOff size={14} />
                      )}

                      Hide
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty */}
            {reviews.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-14 text-center">
                <MessageSquareOff
                  size={28}
                  className="text-ink-soft/40"
                />

                <p className="font-display text-[15px] font-semibold text-ink">
                  No reviews found
                </p>

                <p className="max-w-xs text-[13px] text-ink-soft">
                  Try a different search, rating or
                  status filter.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination &&
            pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="text-[12.5px] text-ink-soft">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={
                      !pagination.hasPreviousPage
                    }
                    onClick={() =>
                      setPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      !pagination.hasNextPage
                    }
                    onClick={() =>
                      setPage((prev) => prev + 1)
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}