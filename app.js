const express = require('express');
const { graphqlHTTP } = require('express-graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const depthLimit = require('graphql-depth-limit');
const cors = require('cors');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');
const dbURI = process.env.DB_URI;

const app = express();
const corsOptions ={
    "origin": "*",
    "methods": "GET,POST,OPTIONS",
    "preflightContinue": false,
    "optionsSuccessStatus": 200
  }
app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//     console.log(req);
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     if (req.method === 'OPTIONS') {
//       return res.sendStatus(200);
//     }
//     next();
//   });
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: process.env.USER,
    pass: process.env.PASS
}).then(res => {
    app.listen(8000);
    console.log('Listening on 8000')
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