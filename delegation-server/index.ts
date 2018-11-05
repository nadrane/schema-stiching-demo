import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import { GraphQLServer } from 'graphql-yoga';

const link = new HttpLink({ uri: 'http://localhost:8001', fetch });

(async () => {
  const schema = await introspectSchema(link);

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link
  });

  const server = new GraphQLServer({ schema: executableSchema });

  server.start({ port: 8002 }, () => console.log('starting delegation server on localhost:8002'));
})();
