"use client";

import dynamic from "next/dynamic";

export const CourtMap = dynamic(() => import("./court-map").then((mod) => mod.CourtMap), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
  ),
});
