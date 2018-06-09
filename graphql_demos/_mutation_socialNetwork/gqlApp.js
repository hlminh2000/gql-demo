const { uniq } = require("lodash");
const makeExecutableSchema = require("graphql-tools").makeExecutableSchema;
const { users } = require("./data.json");

const resolveUser = (_, { id: queryId }) =>
  users
    .filter(({ id }) => id === queryId)
    .map(({ id, name, favoriteColor, friends }) => ({
      id: id,
      name: () => name,
      favoriteColor: () => favoriteColor,
      friends: () => friends.map(friendId => resolveUser(_, { id: friendId }))
    }))[0];

const newUser = (_, { userData: { name, favoriteColor } }) => {
  const id = users.length;
  const newUser = {
    id,
    name,
    favoriteColor,
    friends: []
  };
  users.push(newUser);
  return resolveUser(_, {
    id: newUser.id
  });
};

const newFriendship = (
  _,
  { friendship: { from: fromUserId, to: toUserId } }
) => {
  const fromUser = users.find(({ name }) => name === fromUserId);
  const toUser = users.find(({ name }) => name === toUserId);
  if (fromUser && toUserId) {
    fromUser.friends = uniq([...fromUser.friends, toUserId]);
    toUser.friends = uniq([...toUser.friends, fromUserId]);
  }
  return {
    from: () => resolveUser(_, { id: fromUserId }),
    to: () => resolveUser(_, { id: toUserId })
  };
};

module.exports = makeExecutableSchema({
  typeDefs: `
    type User{
      id: Int
      name: String
      favoriteColor: String
      friends: [User]
    }

    type Friendship {
      from: User!
      to: User!
    }

    type Query {
      user(id: Int!): User
    }

    input UserInput {
      name: String!
      favoriteColor: String!
    }

    input FriendshipInput {
      from: Int!
      to: Int!
    }

    type Mutation {
      newUser(userData: UserInput!): User
      newFriendship(friendship: FriendshipInput!): Friendship
    }
  `,
  resolvers: {
    Query: {
      user: resolveUser
    },
    Mutation: {
      newUser: newUser,
      newFriendship: newFriendship
    }
  }
});
