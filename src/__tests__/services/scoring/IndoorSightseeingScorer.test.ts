import { IndoorSightseeingScorer } from '../../../services/scoring/IndoorSightseeingScorer.js';
import { OutdoorSightseeingScorer } from '../../../services/scoring/OutdoorSightseeingScorer.js';
import { makeDay } from './testHelpers.js';

const indoor = new IndoorSightseeingScorer();
const outdoor = new OutdoorSightseeingScorer();

describe('IndoorSightseeingScorer', () => {
  it('is always the inverse of the outdoor score', () => {
    const days = [
      makeDay({ temperatureMax: 20, precipitationMm: 0, weatherCode: 0 }),
      makeDay({ precipitationMm: 15, weatherCode: 61 }),
      makeDay({ temperatureMax: -5, snowfallMm: 10 }),
    ];
    for (const day of days) {
      expect(indoor.score(day)).toBeCloseTo(10 - outdoor.score(day), 1);
    }
  });

  it('scores high when outdoor conditions are terrible', () => {
    const score = indoor.score(makeDay({ precipitationMm: 20, weatherCode: 95, windSpeedMax: 60 }));
    expect(score).toBeGreaterThan(7);
  });

  it('scores low on a perfect outdoor day', () => {
    const score = indoor.score(makeDay({ temperatureMax: 20, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0 }));
    expect(score).toBeLessThan(3);
  });

  it('returns score between 0 and 10', () => {
    const score = indoor.score(makeDay());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});
