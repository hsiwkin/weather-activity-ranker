import type { DayWeather } from '../weather.js';
import type { ActivityScorer } from './ActivityScorer.js';

export class OutdoorSightseeingScorer implements ActivityScorer {
  readonly name = 'outdoorSightseeing';

  score(weather: DayWeather): number {
    const s =
      this.scoreTemp(weather.temperatureMax) * 0.3 +
      this.scorePrecip(weather.precipitationMm) * 0.3 +
      this.scoreWind(weather.windSpeedMax) * 0.2 +
      this.scoreWeatherCode(weather.weatherCode) * 0.2;
    return parseFloat((s * 10).toFixed(1));
  }

  private scoreTemp(tempMax: number): number {
    // comfortable walking: 15–25°C
    if (tempMax < 5) return 0;
    if (tempMax <= 15) return (tempMax - 5) / 10;
    if (tempMax <= 25) return 1;
    if (tempMax <= 35) return (35 - tempMax) / 10;
    return 0;
  }

  private scorePrecip(precipMm: number): number {
    // dry is ideal; above 10mm = unpleasant
    if (precipMm <= 1) return 1;
    if (precipMm >= 10) return 0;
    return (10 - precipMm) / 9;
  }

  private scoreWind(windMax: number): number {
    // calm: great; gusty above 30 km/h: unpleasant
    if (windMax <= 15) return 1;
    if (windMax >= 40) return 0;
    return (40 - windMax) / 25;
  }

  private scoreWeatherCode(code: number): number {
    // WMO weather interpretation codes
    if (code <= 1) return 1;    // clear sky / mainly clear
    if (code <= 3) return 0.7;  // partly cloudy / overcast
    if (code <= 48) return 0.4; // fog / depositing rime fog
    if (code <= 67) return 0.1; // drizzle / rain
    if (code <= 77) return 0.3; // snow (scenic but cold)
    if (code <= 82) return 0.1; // rain showers
    return 0;                   // thunderstorm
  }
}
