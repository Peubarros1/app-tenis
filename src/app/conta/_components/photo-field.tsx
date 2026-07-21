"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";

export interface PhotoFieldProps {
  defaultValue: string;
  name: string;
}

export function PhotoField({ defaultValue, name }: PhotoFieldProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
      Foto de perfil (URL)
      <div className="flex items-center gap-3">
        <Avatar src={value} size="lg" />
        <input
          type="url"
          name={name}
          placeholder="https://…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
    </label>
  );
}
