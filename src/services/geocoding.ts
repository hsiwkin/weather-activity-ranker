import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { cityLocations } from '../db/schema.js';

export interface Coordinates {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeocodingApiResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  }>;
}

export async function geocodeCity(city: string): Promise<Coordinates> {
  const normalized = city.toLowerCase().trim();

  const existing = db
    .select()
    .from(cityLocations)
    .where(eq(cityLocations.name, normalized))
    .get();

  if (existing) {
    return { name: existing.name, latitude: existing.latitude, longitude: existing.longitude };
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeocodingApiResponse;

  if (!data.results || data.results.length === 0) {
    throw new Error(`City not found: "${city}"`);
  }

  const result = data.results[0];

  db.insert(cityLocations)
    .values({ name: normalized, latitude: result.latitude, longitude: result.longitude })
    .onConflictDoNothing()
    .run();

  return { name: result.name, latitude: result.latitude, longitude: result.longitude };
}
