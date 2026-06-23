import { SkiingScorer } from '../../../services/scoring/SkiingScorer.js';
import { makeDay } from './testHelpers.js';

const scorer = new SkiingScorer();

describe('SkiingScorer', () => {
  it('scores high on ideal conditions: cold, heavy snowfall, calm wind, no rain', () => {
    const score = scorer.score(makeDay({ temperatureMax: -5, snowfallMm: 200, windSpeedMax: 10, precipitationMm: 0 }));
    expect(score).toBeGreaterThanOrEqual(8);
  });

  it('scores low when warm with no snow', () => {
    const score = scorer.score(makeDay({ temperatureMax: 15, snowfallMm: 0, precipitationMm: 0 }));
    expect(score).toBeLessThan(4);
  });

  it('more snowfall produces a higher score', () => {
    const low = scorer.score(makeDay({ snowfallMm: 0 }));
    const high = scorer.score(makeDay({ snowfallMm: 200 }));
    expect(high).toBeGreaterThan(low);
  });

  it('penalises rain even when cold (rain wets the snow)', () => {
    const dry = scorer.score(makeDay({ temperatureMax: -3, snowfallMm: 0, precipitationMm: 0 }));
    const rainy = scorer.score(makeDay({ temperatureMax: -3, snowfallMm: 0, precipitationMm: 5 }));
    expect(rainy).toBeLessThan(dry);
  });

  it('does not penalise precipitation when snowfall is present (it is snow, not rain)', () => {
    const snowOnly = scorer.score(makeDay({ snowfallMm: 100, precipitationMm: 5 }));
    const drySnow = scorer.score(makeDay({ snowfallMm: 100, precipitationMm: 0 }));
    expect(snowOnly).toBeCloseTo(drySnow, 0);
  });

  it('penalises dangerous wind speeds', () => {
    const calm = scorer.score(makeDay({ windSpeedMax: 10, snowfallMm: 100 }));
    const storm = scorer.score(makeDay({ windSpeedMax: 70, snowfallMm: 100 }));
    expect(storm).toBeLessThan(calm);
  });

  it('returns score between 0 and 10', () => {
    const score = scorer.score(makeDay());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});
