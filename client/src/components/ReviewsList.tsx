import { Star, ThumbsUp, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Review } from "../../../drizzle/schema";

interface ReviewsListProps {
  productId: string;
  reviews: Review[];
  onReviewDeleted?: () => void;
}

export default function ReviewsList({
  productId,
  reviews,
  onReviewDeleted,
}: ReviewsListProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const deleteReviewMutation = trpc.reviews.delete.useMutation();
  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Tem certeza que deseja remover esta avaliação?")) return;

    try {
      await deleteReviewMutation.mutateAsync({ id: reviewId });
      toast.success("Avaliação removida");
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover avaliação");
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpfulMutation.mutateAsync({ id: reviewId });
      toast.success("Obrigado pelo feedback!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao marcar como útil");
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(239,239,239,0.6)]">
          Nenhuma avaliação ainda. Seja o primeiro a avaliar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-[rgba(239,239,239,0.3)]"
                      }`}
                    />
                  ))}
                </div>
                {review.verified === 1 && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    Compra Verificada
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-[#EFEFEF] font-semibold mb-1">
                {review.title}
              </h4>

              {/* Metadata */}
              <p className="text-[rgba(239,239,239,0.4)] text-sm">
                {new Date(review.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Actions */}
            {user?.id === review.userId && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(review.id)}
                  className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} className="text-[rgba(239,239,239,0.6)]" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 hover:bg-red-500/10 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* Comment */}
          <p className="text-[rgba(239,239,239,0.8)] mb-4 leading-relaxed">
            {review.comment}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => handleMarkHelpful(review.id)}
              className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
            >
              <ThumbsUp size={16} />
              <span className="text-sm">Útil ({review.helpful})</span>
            </button>

            {user?.id === review.userId && (
              <span className="text-xs text-[rgba(239,239,239,0.4)]">
                Sua avaliação
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
