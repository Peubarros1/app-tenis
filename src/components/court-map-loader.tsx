"use client";

import dynamic from "next/dynamic";

export const CourtMap = dynamic(() => import("./court-map").then((mod) => mod.CourtMap), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-zinc-100 dark:bg-zinc-900" />,
});
