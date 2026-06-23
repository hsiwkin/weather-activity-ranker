import type { DayWeather } from '../weather.js';
import type { ActivityScorer } from './ActivityScorer.js';

export class SkiingScorer implements ActivityScorer {
  readonly name = 'skiing';

  score(weather: DayWeather): number {
    const s =
      this.scoreSnow(weather.snowfallMm) * 0.4 +
      this.scoreTemp(weather.temperatureMax) * 0.3 +
      this.scoreWind(weather.windSpeedMax) * 0.2 +
      this.scoreNoRain(weather.precipitationMm, weather.snowfallMm) * 0.1;
    return parseFloat((s * 10).toFixed(1));
  }

  private scoreSnow(snowfall: number): number {
    // snowfall (mm): 0 → 0, 200+ → 1
    return Math.min(snowfall / 200, 1);
  }

  private scoreTemp(tempMax: number): number {
    // ideal below -5°C, acceptable up to 2°C, bad above 5°C
    if (tempMax <= -5) return 1;
    if (tempMax >= 5) return 0;
    return (5 - tempMax) / 10;
  }

  private scoreWind(windMax: number): number {
    // calm to moderate: great; above 50 km/h: dangerous
    if (windMax <= 20) return 1;
    if (windMax >= 50) return 0;
    return (50 - windMax) / 30;
  }

  private scoreNoRain(precipMm: number, snowfall: number): number {
    // rain (precip without snow) wets the snow and ruins conditions
    const isRain = snowfall < 10 && precipMm > 0;
    if (!isRain) return 1;
    if (precipMm >= 5) return 0;
    return 1 - precipMm / 5;
  }
}
