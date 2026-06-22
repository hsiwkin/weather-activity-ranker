import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { connectRedis, redis } from './cache/redis.js';
import { resolvers } from './schema/resolvers.js';
import { typeDefs } from './schema/typeDefs.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const server = new ApolloServer({ typeDefs, resolvers });

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
