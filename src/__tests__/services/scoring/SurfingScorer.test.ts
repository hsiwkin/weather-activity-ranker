import { SurfingScorer } from '../../../services/scoring/SurfingScorer.js';
import { makeDay } from './testHelpers.js';

const scorer = new SurfingScorer();

describe('SurfingScorer', () => {
  it('scores high with ideal wind, warm temperature, and no rain', () => {
    const score = scorer.score(makeDay({ windSpeedMax: 30, temperatureMax: 22, precipitationMm: 0 }));
    expect(score).toBeGreaterThanOrEqual(8);
  });

  it('scores low with no wind (flat sea, cold water)', () => {
    // wind=0 eliminates 50% of score; cold temp (5°C) eliminates most of the remainder
    const score = scorer.score(makeDay({ windSpeedMax: 5, temperatureMax: 5 }));
    expect(score).toBeLessThan(3);
  });

  it('scores low in dangerous wind with cold conditions', () => {
    const score = scorer.score(makeDay({ windSpeedMax: 80, temperatureMax: 5, precipitationMm: 15 }));
    expect(score).toBeLessThan(3);
  });

  it('moderate wind (15–40 km/h) scores higher than very low or very high wind', () => {
    const flat = scorer.score(makeDay({ windSpeedMax: 5 }));
    const good = scorer.score(makeDay({ windSpeedMax: 25 }));
    const storm = scorer.score(makeDay({ windSpeedMax: 80 }));
    expect(good).toBeGreaterThan(flat);
    expect(good).toBeGreaterThan(storm);
  });

  it('penalises heavy rain', () => {
    const dry = scorer.score(makeDay({ windSpeedMax: 25, precipitationMm: 0 }));
    const heavy = scorer.score(makeDay({ windSpeedMax: 25, precipitationMm: 20 }));
    expect(heavy).toBeLessThan(dry);
  });

  it('returns score between 0 and 10', () => {
    const score = scorer.score(makeDay());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});
