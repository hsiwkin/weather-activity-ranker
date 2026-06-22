import type { ActivityScorer } from './ActivityScorer.js';
import { IndoorSightseeingScorer } from './IndoorSightseeingScorer.js';
import { OutdoorSightseeingScorer } from './OutdoorSightseeingScorer.js';
import { SkiingScorer } from './SkiingScorer.js';
import { SurfingScorer } from './SurfingScorer.js';

export type { ActivityScorer };

export const scorers: ActivityScorer[] = [
  new SkiingScorer(),
  new SurfingScorer(),
  new OutdoorSightseeingScorer(),
  new IndoorSightseeingScorer(),
];
