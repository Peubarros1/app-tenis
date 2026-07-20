"use client";

import { useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  function request() {
    if (!("geolocation" in navigator)) {
      setStatus("denied");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 },
    );
  }

  return { coords, status, request };
}
