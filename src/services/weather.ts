import { fetchWeatherApi } from 'openmeteo';
import { getWeatherCache, setWeatherCache } from '../cache/redis.js';
import type { Coordinates } from './geocoding.js';

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS ?? '3600', 10);

export interface DayWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationMm: number;
  windSpeedMax: number;
  snowfallMm: number;
  weatherCode: number;
}

export async function getWeatherForecast(coords: Coordinates): Promise<DayWeather[]> {
  const cached = await getWeatherCache<DayWeather[]>(coords.name);
  if (cached) {
    console.log(`Cache hit for "${coords.name}"`);
    return cached;
  }

  console.log(`Cache miss for "${coords.name}" — fetching from Open-Meteo`);

  const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', {
    latitude: [coords.latitude],
    longitude: [coords.longitude],
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'snowfall_sum',
      'weather_code',
    ],
    forecast_days: 7,
    timezone: 'auto',
  });

  const response = responses[0];
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const daily = response.daily()!;

  const dates: string[] = [];
  const start = Number(daily.time());
  const end = Number(daily.timeEnd());
  const interval = daily.interval();
  for (let t = start; t < end; t += interval) {
    dates.push(new Date((t + utcOffsetSeconds) * 1000).toISOString().slice(0, 10));
  }

  const temperatureMax = daily.variables(0)!.valuesArray()!;
  const temperatureMin = daily.variables(1)!.valuesArray()!;
  const precipitationSum = daily.variables(2)!.valuesArray()!;
  const windSpeedMax = daily.variables(3)!.valuesArray()!;
  const snowfallSum = daily.variables(4)!.valuesArray()!;
  const weatherCode = daily.variables(5)!.valuesArray()!;

  const forecast: DayWeather[] = dates.map((date, i) => ({
    date,
    temperatureMax: temperatureMax[i],
    temperatureMin: temperatureMin[i],
    precipitationMm: precipitationSum[i],
    windSpeedMax: windSpeedMax[i],
    snowfallMm: snowfallSum[i] * 10, // Open-Meteo returns snowfall in cm; convert to mm for consistency with precipitationMm
    weatherCode: Math.round(weatherCode[i]),
  }));

  await setWeatherCache(coords.name, forecast, CACHE_TTL_SECONDS);
  return forecast;
}
