export function StarRating({
  rating,
  reviewCount,
}: {
  rating: number | null;
  reviewCount: number;
}) {
  if (rating === null) {
    return <span className="text-sm text-zinc-500 dark:text-zinc-400">Sem avaliações ainda</span>;
  }

  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span aria-hidden className="tracking-tight text-amber-500">
        {"★".repeat(rounded)}
        <span className="text-zinc-300 dark:text-zinc-700">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-zinc-600 dark:text-zinc-400">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}
