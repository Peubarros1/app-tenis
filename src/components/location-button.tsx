"use client";

import { useState } from "react";

export function LocationButton({
  initialLatitude,
  initialLongitude,
}: {
  initialLatitude: number | null;
  initialLongitude: number | null;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLatitude !== null && initialLongitude !== null
      ? { lat: initialLatitude, lng: initialLongitude }
      : null,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const form = document.getElementById("profile-form") as HTMLFormElement | null;
        const latInput = form?.elements.namedItem("latitude") as HTMLInputElement | null;
        const lngInput = form?.elements.namedItem("longitude") as HTMLInputElement | null;
        if (latInput) latInput.value = String(position.coords.latitude);
        if (lngInput) lngInput.value = String(position.coords.longitude);

        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("idle");
      },
      () => setStatus("error"),
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="w-fit rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        {status === "loading" ? "Obtendo localização…" : "Usar minha localização atual"}
      </button>
      {coords && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Localização salva: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
      )}
      {status === "error" && (
        <span className="text-xs text-red-600 dark:text-red-400">
          Não foi possível obter sua localização. Verifique as permissões do navegador.
        </span>
      )}
    </div>
  );
}
