export const typeDefs = `#graphql
  type Query {
    rankCity(city: String!): CityRanking!
  }

  type CityRanking {
    city: String!
    latitude: Float!
    longitude: Float!
    days: [DayRanking!]!
  }

  type DayRanking {
    "ISO date: YYYY-MM-DD"
    date: String!
    scores: ActivityScores!
    weather: WeatherSummary!
  }

  type ActivityScores {
    "Score 0–10"
    skiing: Float!
    surfing: Float!
    outdoorSightseeing: Float!
    indoorSightseeing: Float!
  }

  type WeatherSummary {
    temperatureMax: Float!
    temperatureMin: Float!
    precipitationMm: Float!
    windSpeedMax: Float!
    snowfallMm: Float!
    "WMO weather interpretation code"
    weatherCode: Int!
  }
`;
