import { geocodeCity } from '../services/geocoding.js';
import { scorers } from '../services/scoring/index.js';
import { getWeatherForecast } from '../services/weather.js';

export const resolvers = {
  Query: {
    rankCity: async (_: unknown, { city }: { city: string }) => {
      const coords = await geocodeCity(city);
      const forecast = await getWeatherForecast(coords);

      return {
        city: coords.name,
        latitude: coords.latitude,
        longitude: coords.longitude,
        days: forecast.map((day) => ({
          date: day.date,
          scores: Object.fromEntries(scorers.map((s) => [s.name, s.score(day)])),
          weather: {
            temperatureMax: day.temperatureMax,
            temperatureMin: day.temperatureMin,
            precipitationMm: day.precipitationMm,
            windSpeedMax: day.windSpeedMax,
            snowfallMm: day.snowfallMm,
            weatherCode: day.weatherCode,
          },
        })),
      };
    },
  },
};
