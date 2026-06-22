import type { DayWeather } from '../../../services/weather.js';

export const makeDay = (overrides: Partial<DayWeather> = {}): DayWeather => ({
  date: '2024-01-01',
  temperatureMax: 10,
  temperatureMin: 5,
  precipitationMm: 0,
  windSpeedMax: 15,
  snowfallMm: 0,
  weatherCode: 0,
  ...overrides,
});
