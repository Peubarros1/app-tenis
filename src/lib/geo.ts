const EARTH_RADIUS_KM = 6371;

/** Distância em linha reta (haversine), em km. */
export function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Estimativa grosseira de tempo de carro a partir da distância em linha reta,
 * assumindo ~25km/h médios (trânsito urbano do Recife). É só uma estimativa —
 * sem roteamento de verdade, que exigiria uma API paga.
 */
export function estimateDriveMinutes(km: number): number {
  const AVERAGE_URBAN_SPEED_KMH = 25;
  return Math.max(1, Math.round((km / AVERAGE_URBAN_SPEED_KMH) * 60));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
