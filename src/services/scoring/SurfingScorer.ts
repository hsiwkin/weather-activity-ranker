import type { DayWeather } from '../weather.js';
import type { ActivityScorer } from './ActivityScorer.js';

export class SurfingScorer implements ActivityScorer {
  readonly name = 'surfing';

  // NOTE: Open-Meteo does not provide marine wave data for inland coordinates.
  // Wind speed is used as a proxy for wave-generating conditions.
  // This is a known limitation documented in the README.

  score(weather: DayWeather): number {
    const s =
      this.scoreWind(weather.windSpeedMax) * 0.5 +
      this.scoreTemp(weather.temperatureMax) * 0.3 +
      this.scoreNoRain(weather.precipitationMm) * 0.2;
    return parseFloat((s * 10).toFixed(1));
  }

  private scoreWind(windMax: number): number {
    // 15–40 km/h generates surfable waves; below 10 = flat, above 60 = dangerous
    if (windMax < 10) return 0;
    if (windMax <= 25) return (windMax - 10) / 15;
    if (windMax <= 40) return 1;
    if (windMax <= 60) return (60 - windMax) / 20;
    return 0;
  }

  private scoreTemp(tempMax: number): number {
    // comfortable range: 15–28°C
    if (tempMax < 10) return 0;
    if (tempMax <= 20) return (tempMax - 10) / 10;
    if (tempMax <= 28) return 1;
    if (tempMax <= 35) return (35 - tempMax) / 7;
    return 0;
  }

  private scoreNoRain(precipMm: number): number {
    // light rain acceptable; heavy rain unpleasant
    if (precipMm <= 2) return 1;
    if (precipMm >= 15) return 0;
    return (15 - precipMm) / 13;
  }
}
