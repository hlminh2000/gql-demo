const GQL_APP = process.env.GQL_APP || "demo-socialNetwork";
const PORT = process.env.PORT || 3000;
const { isEqual } = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const graphqlExpress = require("graphql-server-express").graphqlExpress;
const graphiqlExpress = require("graphql-server-express").graphiqlExpress;
const fetch = require("node-fetch");
const cors = require("cors");

const schema = require(`./${GQL_APP}/gqlApp`);
const targetData = require(`./${GQL_APP}/targetData.json`);

const app = express();
app.use(cors(), bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.use("/graphql_private", graphqlExpress({ schema, context: {} }));

app.use("/graphql", (req, res) => {
  const { query, variables } = req.body;
  const userName = req.headers["user-name"];
  fetch(`http://localhost:${PORT}/graphql_private`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables })
  })
    .then(res => res.json())
    .then(data => {
      if (isEqual(targetData, data)) {
        console.log("CORRECT!!!!: ", userName);
      }
      res.send(data);
    });
});
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
