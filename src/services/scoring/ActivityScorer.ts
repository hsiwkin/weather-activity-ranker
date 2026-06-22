import type { DayWeather } from '../weather.js';

export interface ActivityScorer {
  readonly name: string;
  score(weather: DayWeather): number;
}
