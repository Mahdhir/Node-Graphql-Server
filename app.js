const express = require('express');
const { graphqlHTTP } = require('express-graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const depthLimit = require('graphql-depth-limit');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');
const dbURI = process.env.DB_URI;

const app = express();

app.use(express.json());

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: process.env.USER,
    pass: process.env.PASS
}).then(res => {
    app.listen(3000);
    console.log("Listening on 3000")
})
    .catch(err => console.log(err));

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
    validationRules: [depthLimit(3)]
}))

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})