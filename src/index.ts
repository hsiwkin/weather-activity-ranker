import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { startStandaloneServer } from '@apollo/server/standalone';
import { connectRedis, redis } from './cache/redis.js';
import { resolvers } from './schema/resolvers.js';
import { typeDefs } from './schema/typeDefs.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const defaultQuery = `query ExampleQuery {
  rankCity(city: "Innsbruck") {
    city
    latitude
    longitude
    days {
      date
      scores {
        skiing
        surfing
        outdoorSightseeing
        indoorSightseeing
      }
      weather {
        temperatureMax
        temperatureMin
        precipitationMm
        windSpeedMax
        snowfallMm
        weatherCode
      }
    }
  }
}`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ document: defaultQuery })],
});

await connectRedis();

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
});

console.log(`Server ready at ${url}`);

const shutdown = async () => {
  await server.stop();
  await redis.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
