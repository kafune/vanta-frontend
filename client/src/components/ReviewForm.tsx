import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Por favor, selecione uma classificação");
      return;
    }

    if (title.trim().length < 3) {
      toast.error("O título deve ter pelo menos 3 caracteres");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("O comentário deve ter pelo menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReviewMutation.mutateAsync({
        productId,
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      toast.success("Avaliação enviada para moderação!");
      setRating(0);
      setTitle("");
      setComment("");

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6"
    >
      <h3 className="text-[#EFEFEF] font-semibold mb-4">Deixe sua avaliação</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-[rgba(239,239,239,0.8)] text-sm mb-3">
          Classificação
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={`${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-[rgba(239,239,239,0.3)]"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-[rgba(239,239,239,0.8)] text-sm mb-2">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resumo da sua avaliação"
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#EFEFEF] placeholder-[rgba(239,239,239,0.4)] focus:outline-none focus:border-[rgba(255,255,255,0.3)]"
          maxLength={255}
        />
        <p className="text-[rgba(239,239,239,0.4)] text-xs mt-1">
          {title.length}/255
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-[rgba(239,239,239,0.8)] text-sm mb-2">
          Comentário
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência com este produto..."
          rows={5}
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#EFEFEF] placeholder-[rgba(239,239,239,0.4)] focus:outline-none focus:border-[rgba(255,255,255,0.3)] resize-none"
          maxLength={5000}
        />
        <p className="text-[rgba(239,239,239,0.4)] text-xs mt-1">
          {comment.length}/5000
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#EFEFEF] text-[#0B0B0B] hover:bg-white disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send size={16} className="mr-2" />
            Enviar Avaliação
          </>
        )}
      </Button>

      <p className="text-[rgba(239,239,239,0.4)] text-xs mt-3">
        Sua avaliação será revisada antes de ser publicada.
      </p>
    </form>
  );
}
