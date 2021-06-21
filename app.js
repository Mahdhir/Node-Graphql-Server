const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const { buildSchema } = require('graphql');
const app = express();

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type RootQuery{
            events: [String!]!
        }

        type RootMutation{
            createEvent(name:String!):String
        }

        schema {
            query: RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['Sample Item 1', 'Sample Item 2']
        },
        createEvent: (args) => {
            return args.name.toUpperCase();
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})

app.listen(3000);