import type { DayWeather } from '../weather.js';
import type { ActivityScorer } from './ActivityScorer.js';
import { OutdoorSightseeingScorer } from './OutdoorSightseeingScorer.js';

export class IndoorSightseeingScorer implements ActivityScorer {
  readonly name = 'indoorSightseeing';

  private readonly outdoor = new OutdoorSightseeingScorer();

  // Indoor sightseeing is the inverse of outdoor: bad weather outside
  // means you'd rather be in a museum or gallery.
  score(weather: DayWeather): number {
    return parseFloat((10 - this.outdoor.score(weather)).toFixed(1));
  }
}
