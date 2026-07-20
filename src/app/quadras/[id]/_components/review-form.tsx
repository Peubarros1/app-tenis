"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewFormProps {
  courtId: string;
  action: (formData: FormData) => void;
}

export function ReviewForm({ courtId, action }: ReviewFormProps) {
  const [rating, setRating] = React.useState(5);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="courtId" value={courtId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sua nota</span>
        <RatingStars value={rating} onChange={setRating} interactive size="lg" />
      </div>
      <Textarea name="comment" rows={2} maxLength={500} placeholder="Comentário (opcional)" />
      <Button type="submit" size="sm" className="w-fit">
        Enviar avaliação
      </Button>
    </form>
  );
}
