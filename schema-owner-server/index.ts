import { GraphQLServer } from 'graphql-yoga';
import { TypeComposer } from 'graphql-compose';

const users = {
  1: {
    id: 1,
    name: 'nick'
  },
  2: {
    id: 2,
    name: 'cedric'
  },
  3: {
    id: 3,
    name: 'mari'
  }
};

TypeComposer.create({
  name: 'User',
  fields: {
    id: 'Int!',
    name: 'String'
  }
});

const typeDefs = `
  type Query {
    getUser(id: ID): User!
  }

  type User {
    id: ID!
    name: String
  }
`;

const resolvers = {
  Query: {
    getUser: (_, { id }) => users[id]
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start({ port: 8001 }, () => console.log('Starting schema owner server localhost:8001'));
