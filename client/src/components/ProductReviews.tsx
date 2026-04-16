import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProductReviewsProps {
  productId: string;
  orderId?: string;
  canReview?: boolean;
}

export default function ProductReviews({
  productId,
  orderId,
  canReview = false,
}: ProductReviewsProps) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: reviews, isLoading: reviewsLoading } =
    trpc.reviews.getByProductId.useQuery({ productId }, { staleTime: 0 });

  const { data: avgRating, isLoading: ratingLoading } =
    trpc.reviews.getAverageRating.useQuery({ productId });

  const handleReviewSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleReviewDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6">
        <h2 className="text-[#EFEFEF] text-2xl font-bold mb-6">Avaliações</h2>

        {ratingLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[rgba(239,239,239,0.6)]" />
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-bold text-[#EFEFEF]">
                  {avgRating?.average || 0}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={`${
                        star <= Math.round(avgRating?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-[rgba(239,239,239,0.3)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[rgba(239,239,239,0.6)]">
                {avgRating?.count || 0} avaliações
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  reviews?.filter((r) => r.rating === rating).length || 0;
                const total = reviews?.length || 1;
                const percentage = (count / total) * 100;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-[rgba(239,239,239,0.6)] w-8">
                      {rating}★
                    </span>
                    <div className="flex-1 bg-[rgba(255,255,255,0.1)] rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-[rgba(239,239,239,0.6)] w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      {canReview && user && orderId && (
        <ReviewForm
          productId={productId}
          orderId={orderId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-[#EFEFEF] text-xl font-bold mb-6">
          Comentários dos Clientes
        </h3>

        {reviewsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[rgba(239,239,239,0.6)]" />
          </div>
        ) : (
          <ReviewsList
            key={refreshKey}
            productId={productId}
            reviews={reviews || []}
            onReviewDeleted={handleReviewDeleted}
          />
        )}
      </div>
    </div>
  );
}
