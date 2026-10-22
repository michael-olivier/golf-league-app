export interface GeoCoords {
  lat: number;
  lng: number;
}

export function formatCoordsLabel({ lat, lng }: GeoCoords): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lng).toFixed(2)}° ${ew}`;
}

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
}

/** Free client-side reverse geocode (no API key). */
export async function fetchPlaceLabel(
  coords: GeoCoords,
  signal?: AbortSignal,
): Promise<string> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lng),
    localityLanguage: "en",
  });
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    { signal },
  );
  if (!res.ok) {
    return formatCoordsLabel(coords);
  }
  const data = (await res.json()) as ReverseGeocodeResponse;
  const city = data.city || data.locality;
  const region = data.principalSubdivision;
  if (city && region) return `${city}, ${region}`;
  if (city) return city;
  if (region) return region;
  return formatCoordsLabel(coords);
}
