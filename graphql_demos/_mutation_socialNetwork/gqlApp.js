const { uniq } = require("lodash");
const makeExecutableSchema = require("graphql-tools").makeExecutableSchema;
const { users } = require("./data.json");

const resolveUser = (_, { name: queryName }) =>
  users
    .filter(({ name }) => name === queryName)
    .map(({ name, favoriteColor, friends }) => ({
      name: () => name,
      favoriteColor: () => favoriteColor,
      friends: () =>
        friends.map(friendName => resolveUser(_, { name: friendName }))
    }))[0];

const newUser = (_, { userData: { name, favoriteColor } }) => {
  const newUser = {
    name,
    favoriteColor,
    friends: []
  };
  const existingUser = users.find(({ name: _name }) => name === _name);
  if (!existingUser) {
    users.push(newUser);
  }
  return resolveUser(_, {
    name: existingUser ? existingUser.name : newUser.name
  });
};

const newFriendship = (
  _,
  { friendship: { from: fromUserName, to: toUserName } }
) => {
  const fromUser = users.find(({ name }) => name === fromUserName);
  const toUser = users.find(({ name }) => name === toUserName);
  if (fromUser && toUserName) {
    fromUser.friends = uniq([...fromUser.friends, toUserName]);
    toUser.friends = uniq([...toUser.friends, fromUserName]);
  }
  return {
    from: () => resolveUser(_, { name: fromUserName }),
    to: () => resolveUser(_, { name: toUserName })
  };
};

module.exports = makeExecutableSchema({
  typeDefs: `
    type User {
      name: String
      favoriteColor: String
      friends: [User]
    }

    type Friendship {
      from: User!
      to: User!
    }

    type Query {
      user(name:String!): User
    }

    input UserInput {
      name: String!
      favoriteColor: String!
    }

    input FriendshipInput {
      from: String!
      to: String!
    }

    type Mutation {
      newUser(userData: UserInput!): User
      newFriendship(friendship: FriendshipInput): Friendship
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
