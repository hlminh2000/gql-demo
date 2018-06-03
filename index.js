const GQL_APP = process.env.GQL_APP || "_mutation_socialNetwork";
const PORT = process.env.PORT || 3000;
const { isEqual } = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const graphqlExpress = require("graphql-server-express").graphqlExpress;
const graphiqlExpress = require("graphql-server-express").graphiqlExpress;
const fetch = require("node-fetch");
const cors = require("cors");

const schema = require(`./graphql_demos/${GQL_APP}/gqlApp`);
const targetData = require(`./graphql_demos/${GQL_APP}/targetData.json`);

const app = express();
app.use(cors(), bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.use("/graphql", graphqlExpress({ schema, context: {} }));
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql_game" }));

// these endpoints are only here for the game during the workshop
app.use("/graphql_game", (req, res) => {
  const userName = req.headers["user-name"];
  const { query, variables } = req.body;
  fetch(`http://localhost:${PORT}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables })
  })
    .then(res => res.json())
    .then(data => {
      if (isEqual(targetData, data)) {
        console.log("=======================");
        console.log("CORRECT!!!!: ", userName);
        console.log("=======================");
      }
      res.send(data);
    });
});
app.use("/graphiql_game", graphiqlExpress({ endpointURL: "/graphql_game" }));

app.listen(PORT, () => {
  console.log("===============================================");
  console.log(`| graphql:  http://localhost:${PORT}/graphql`);
  console.log(`| graphiql: http://localhost:${PORT}/graphiql`);
  console.log("-----------------------------------------------");
  console.log(`| game:     http://localhost:${PORT}/graphiql_game`);
  console.log("===============================================");
});
