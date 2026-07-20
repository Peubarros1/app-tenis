"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { CourtType } from "@/generated/prisma/enums";
import type { CourtSummary } from "@/domain/repositories/court-repository";

const RECIFE_CENTER: [number, number] = [-8.0578, -34.8829];

function pinIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        display:flex;align-items:center;justify-content:center;
        filter:drop-shadow(0 2px 4px rgb(0 0 0 / 0.25));
        transition:transform 150ms ease;
        transform:${selected ? "scale(1.08)" : "scale(1)"};
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
          <path d="M16 2C9.4 2 4 7.4 4 14c0 8.5 10.5 15.2 11 15.5.3.2.7.2 1 0 .5-.3 11-7 11-15.5C27 7.4 21.6 2 16 2Z" fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="16" cy="14" r="5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function userLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgb(37 99 235 / 0.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function RecenterOnCourts({ courts }: { courts: CourtSummary[] }) {
  const map = useMap();
  // Signature (not the array reference) drives recentering, since an
  // unrelated update (e.g. an optimistic favorite toggle) produces a new
  // `courts` array with the same court set and shouldn't yank the viewport
  // out from under the user mid-interaction.
  const signature = courts
    .map((court) => `${court.id}:${court.latitude}:${court.longitude}`)
    .sort()
    .join("|");

  useEffect(() => {
    if (courts.length === 0) return;
    const bounds = L.latLngBounds(courts.map((court) => [court.latitude, court.longitude]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 15, duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recentragem deve reagir ao conjunto de quadras (signature), não à identidade do array
  }, [signature, map]);

  return null;
}

export interface CourtMapProps {
  courts: CourtSummary[];
  selectedCourtId?: string | null;
  onSelectCourt?: (courtId: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function CourtMap({ courts, selectedCourtId, onSelectCourt, userLocation }: CourtMapProps) {
  return (
    <MapContainer
      center={RECIFE_CENTER}
      zoom={12}
      scrollWheelZoom
      className="size-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnCourts courts={courts} />
      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userLocationIcon()}
          interactive={false}
        />
      )}
      {courts.map((court) => (
        <Marker
          key={court.id}
          position={[court.latitude, court.longitude]}
          icon={pinIcon(
            court.courtType === CourtType.PRIVATE ? "#ff5a2e" : "#157f77",
            court.id === selectedCourtId,
          )}
          eventHandlers={{ click: () => onSelectCourt?.(court.id) }}
        />
      ))}
    </MapContainer>
  );
}
