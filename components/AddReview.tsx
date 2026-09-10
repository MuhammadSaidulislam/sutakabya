"use client";

import React, {
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Eye,
  Pencil,
  Star,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

interface ReviewItem {
  order_id: number;
  order_no: string;
  order_status: string;
  ordered_at: string;

  order_item_id: number;
  product_id: number;
  qty: number;
  item_price: string | number;
  item_subtotal: string | number;
  item_status: string;

  product_name: string;
  product_sku: string;
  product_price: number;
  product_image: string | null;

  review_id: number | null;
  review_rating: number | null;
  review_text: string | null;
  review_status: string | null;
  review_created_at: string | null;
  review_updated_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

interface ReviewStatusProps {
  status: string | null;
}

const Stars = ({
  value,
  onChange,
  readonly = false,
}: StarsProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          aria-label={`Rate ${star} out of 5`}
          className={`rounded-md p-0.5 ${
            readonly
              ? "cursor-default"
              : "transition-transform hover:scale-110"
          }`}
        >
          <Star
            size={18}
            strokeWidth={1.8}
            className={
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-stone-300"
            }
          />
        </button>
      ))}
    </div>
  );
};

const AddReview = () => {
  // ============================================================
  // DATA
  // ============================================================

  const [deliveries, setDeliveries] = useState<ReviewItem[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ============================================================
  // FILTER
  // ============================================================

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(false);

  // ============================================================
  // MODAL
  // ============================================================

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ReviewItem | null>(null);

  // ============================================================
  // REVIEW FORM
  // ============================================================

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // VIEW REVIEW MODAL
  // ============================================================

  const [viewReviewOpen, setViewReviewOpen] = useState(false);

  // ============================================================
  // DELETE
  // ============================================================

  const [deleteLoading, setDeleteLoading] = useState<number | null>(
    null
  );

  // ============================================================
  // FETCH REVIEWS / DELIVERED PRODUCTS
  // ============================================================

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/user/review?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch reviews"
        );
      }

      setDeliveries(result.data || []);

      setPagination(
        result.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error("Get reviews error:", error);

      setDeliveries([]);

      setPagination({
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    startTransition(() => {
      fetchReviews();
    });
  }, [fetchReviews]);

  // ============================================================
  // OPEN WRITE REVIEW
  // ============================================================

  const handleWriteReview = (product: ReviewItem) => {
    setSelectedProduct(product);

    setRating(0);
    setText("");

    setError("");
    setSuccess("");

    setReviewModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT REVIEW
  // ============================================================

  const handleEditReview = (product: ReviewItem) => {
    setSelectedProduct(product);

    setRating(product.review_rating || 0);
    setText(product.review_text || "");

    setError("");
    setSuccess("");

    setReviewModalOpen(true);
  };

  // ============================================================
  // VIEW REVIEW
  // ============================================================

  const handleViewReview = (product: ReviewItem) => {
    setSelectedProduct(product);
    setViewReviewOpen(true);
  };

  // ============================================================
  // CLOSE REVIEW MODAL
  // ============================================================

  const closeReviewModal = () => {
    if (isSubmitting) return;

    setReviewModalOpen(false);
    setSelectedProduct(null);

    setRating(0);
    setText("");

    setError("");
    setSuccess("");
  };

  // ============================================================
  // SUBMIT / UPDATE REVIEW
  // ============================================================

  const handleSubmitReview = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedProduct) {
      setError("Product information is missing.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    if (!text.trim()) {
      setError("Please write a review.");
      return;
    }

    if (text.trim().length > 2000) {
      setError("Review cannot exceed 2000 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      const isEdit = Boolean(selectedProduct.review_id);

      const url = isEdit
        ? `/api/user/review/${selectedProduct.review_id}`
        : "/api/user/review";

      const method = isEdit ? "PUT" : "POST";

      const body = isEdit
        ? {
            rating,
            review: text.trim(),
          }
        : {
            order_id: selectedProduct.order_id,
            product_id: selectedProduct.product_id,
            rating,
            review: text.trim(),
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${isEdit ? "update" : "submit"} review`
        );
      }

      setSuccess(
        isEdit
          ? "Review updated successfully."
          : "Review submitted successfully."
      );

      // Refresh data
      await fetchReviews();

      // Close modal after successful request
      setTimeout(() => {
        closeReviewModal();
      }, 500);
    } catch (error) {
      console.error("Review submit error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">
            My Reviews
          </h2>

          <p className="mt-1 text-sm text-ink-500">
            Review products from your delivered orders.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search product..."
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* ========================================================
          PRODUCTS TABLE
      ======================================================== */}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Product
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Order
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Review
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-ink-500">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-ink-500"
                  >
                    No delivered products found.
                  </td>
                </tr>
              ) : (
                deliveries.map((item) => (
                  <tr
                    key={`${item.order_id}-${item.order_item_id}`}
                    className="border-t border-border transition hover:bg-stone-50/50"
                  >
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-stone-50">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-ink-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate text-sm font-medium text-ink-900">
                            {item.product_name}
                          </p>

                          <p className="mt-1 text-xs text-ink-500">
                            SKU: {item.product_sku}
                          </p>

                          <p className="mt-1 text-xs text-ink-500">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-ink-900">
                        {item.order_no}
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        Delivered
                      </p>
                    </td>
                    {/* Review */}
                    <td className="px-5 py-4">
                      {item.review_id ? (
                        <div>
                          <Stars
                            value={item.review_rating || 0}
                            readonly
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-ink-400">
                          Not reviewed yet
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        {item.review_id ? (
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() =>
                                handleViewReview(item)
                              }
                              title="View review"
                              className="rounded-lg p-2 text-ink-400 transition hover:bg-sky-deep hover:text-white"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEditReview(item)
                              }
                              title="Edit review"
                              className="rounded-lg p-2 text-ink-400 transition hover:bg-amber-500 hover:text-white"
                            >
                              <Pencil size={16} />
                            </button>

                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleWriteReview(item)
                            }
                            className="rounded-lg bg-brand-pink px-3 py-2 text-xs font-medium text-white transition "
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================
            PAGINATION
        ====================================================== */}

        {!loading && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-500">
              Showing{" "}
              <span className="font-medium text-ink-700">
                {(pagination.page - 1) *
                  pagination.limit +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-ink-700">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-ink-700">
                {pagination.total}
              </span>{" "}
              products
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-2 text-sm text-ink-500">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          WRITE / EDIT REVIEW MODAL
      ======================================================== */}

      {reviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">
                  {selectedProduct.review_id
                    ? "Edit Review"
                    : "Write a Review"}
                </h3>

                <p className="mt-1 text-xs text-ink-500">
                  {selectedProduct.product_name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-stone-100 hover:text-ink-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmitReview}
              className="space-y-5 p-5"
            >
              {/* Product */}
              <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-white">
                  {selectedProduct.product_image ? (
                    <img
                      src={selectedProduct.product_image}
                      alt={selectedProduct.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-400">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {selectedProduct.product_name}
                  </p>

                  <p className="mt-1 text-xs text-ink-500">
                    Order: {selectedProduct.order_no}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-800">
                  Your Rating
                </label>

                <Stars
                  value={rating}
                  onChange={setRating}
                />
              </div>

              {/* Review */}
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-800">
                  Your Review
                </label>

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  rows={5}
                  maxLength={2000}
                  placeholder="Share your experience with this product..."
                  className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <div className="mt-1 text-right text-xs text-ink-400">
                  {text.length}/2000
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-pink-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {selectedProduct.review_id
                    ? "Update Review"
                    : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW REVIEW MODAL
      ======================================================== */}

      {viewReviewOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">
                  Your Review
                </h3>

                <p className="mt-1 text-xs text-ink-500">
                  {selectedProduct.product_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewReviewOpen(false);
                  setSelectedProduct(null);
                }}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-stone-100 hover:text-ink-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5">
              {/* Product */}
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl border border-border">
                  {selectedProduct.product_image ? (
                    <img
                      src={selectedProduct.product_image}
                      alt={selectedProduct.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-400">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {selectedProduct.product_name}
                  </p>

                  <p className="mt-1 text-xs text-ink-500">
                    {selectedProduct.product_sku}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">
                  Rating
                </p>

                <Stars
                  value={
                    selectedProduct.review_rating || 0
                  }
                  readonly
                />
              </div>

              {/* Review */}
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">
                  Review
                </p>

                <div className="rounded-xl bg-stone-50 p-4 text-sm leading-6 text-ink-700">
                  {selectedProduct.review_text}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-400">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm text-ink-700">
                    {formatDate(
                      selectedProduct.review_created_at
                    )}
                  </p>
                </div>

              </div>

              {/* Close */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewReviewOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-stone-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReview;