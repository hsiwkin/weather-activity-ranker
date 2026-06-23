import { jest } from '@jest/globals';

// jest.unstable_mockModule is required for ESM — jest.mock() hoisting doesn't
// work reliably with ESM when the factory references variables declared outside it.
jest.unstable_mockModule('../../cache/redis.js', () => ({
  getWeatherCache: jest.fn(),
  setWeatherCache: jest.fn(),
}));

jest.unstable_mockModule('openmeteo', () => ({
  fetchWeatherApi: jest.fn(),
}));

// Dynamic imports must come AFTER unstable_mockModule declarations
const { getWeatherForecast } = await import('../../services/weather.js');
const { getWeatherCache, setWeatherCache } = await import('../../cache/redis.js');
const { fetchWeatherApi } = await import('openmeteo');

import type { DayWeather } from '../../services/weather.js';

const mockGet = getWeatherCache as jest.MockedFunction<typeof getWeatherCache>;
const mockSet = setWeatherCache as jest.MockedFunction<typeof setWeatherCache>;
const mockFetch = fetchWeatherApi as jest.MockedFunction<typeof fetchWeatherApi>;

const COORDS = { name: 'london', latitude: 51.5, longitude: -0.12 };

const CACHED_FORECAST: DayWeather[] = [
  {
    date: '2024-01-01',
    temperatureMax: 10,
    temperatureMin: 5,
    precipitationMm: 2,
    windSpeedMax: 20,
    snowfallMm: 0,
    weatherCode: 3,
  },
];

const makeFloat32 = (value: number, length = 7) => new Float32Array(length).fill(value);

// Minimal flatbuffer-style mock that matches the shape weather.ts reads from
const mockOpenMeteoResponse = [
  {
    utcOffsetSeconds: () => 0,
    daily: () => ({
      time: () => BigInt(0),
      timeEnd: () => BigInt(7 * 86400),
      interval: () => 86400,
      variables: (i: number) =>
        ({ valuesArray: () => makeFloat32([10, 5, 2, 20, 0, 3][i] ?? 0) }),
    }),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getWeatherForecast — cache hit', () => {
  it('returns cached data without calling Open-Meteo', async () => {
    mockGet.mockResolvedValue(CACHED_FORECAST);

    const result = await getWeatherForecast(COORDS);

    expect(result).toEqual(CACHED_FORECAST);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });
});

describe('getWeatherForecast — cache miss', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFetch.mockResolvedValue(mockOpenMeteoResponse as any);
  });

  it('calls Open-Meteo when cache is empty', async () => {
    await getWeatherForecast(COORDS);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('stores the result in the cache after fetching', async () => {
    await getWeatherForecast(COORDS);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(COORDS.name, expect.any(Array), expect.any(Number));
  });

  it('returns 7 days of forecast data', async () => {
    const result = await getWeatherForecast(COORDS);
    expect(result).toHaveLength(7);
  });

  it('each day includes all required weather fields', async () => {
    const [day] = await getWeatherForecast(COORDS);
    expect(day).toMatchObject({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      temperatureMax: expect.any(Number),
      temperatureMin: expect.any(Number),
      precipitationMm: expect.any(Number),
      windSpeedMax: expect.any(Number),
      snowfallMm: expect.any(Number),
      weatherCode: expect.any(Number),
    });
  });
});
