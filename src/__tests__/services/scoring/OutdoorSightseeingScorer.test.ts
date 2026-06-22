import { OutdoorSightseeingScorer } from '../../../services/scoring/OutdoorSightseeingScorer.js';
import { makeDay } from './testHelpers.js';

const scorer = new OutdoorSightseeingScorer();

describe('OutdoorSightseeingScorer', () => {
  it('scores high on a perfect sunny day: warm, dry, calm, clear sky', () => {
    const score = scorer.score(makeDay({ temperatureMax: 20, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0 }));
    expect(score).toBeGreaterThanOrEqual(8);
  });

  it('scores low in heavy rain', () => {
    const score = scorer.score(makeDay({ precipitationMm: 15, weatherCode: 61 }));
    expect(score).toBeLessThan(4);
  });

  it('scores low in a thunderstorm with strong wind and cold', () => {
    const score = scorer.score(makeDay({ precipitationMm: 20, weatherCode: 95, windSpeedMax: 60, temperatureMax: 0 }));
    expect(score).toBeLessThan(1);
  });

  it('clear sky scores higher than overcast', () => {
    const clear = scorer.score(makeDay({ weatherCode: 0 }));
    const overcast = scorer.score(makeDay({ weatherCode: 3 }));
    expect(clear).toBeGreaterThan(overcast);
  });

  it('penalises uncomfortable temperatures', () => {
    const comfortable = scorer.score(makeDay({ temperatureMax: 20 }));
    const freezing = scorer.score(makeDay({ temperatureMax: -5 }));
    const scorching = scorer.score(makeDay({ temperatureMax: 38 }));
    expect(comfortable).toBeGreaterThan(freezing);
    expect(comfortable).toBeGreaterThan(scorching);
  });

  it('returns score between 0 and 10', () => {
    const score = scorer.score(makeDay());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});
