"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RECIFE_CENTER: [number, number] = [-8.0578, -34.8829];

export function CourtMap({
  courts,
}: {
  courts: { id: string; name: string; latitude: number; longitude: number }[];
}) {
  return (
    <MapContainer
      center={RECIFE_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {courts.map((court) => (
        <Marker key={court.id} position={[court.latitude, court.longitude]} icon={markerIcon}>
          <Popup>
            <Link href={`/quadras/${court.id}`} className="font-medium underline">
              {court.name}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
