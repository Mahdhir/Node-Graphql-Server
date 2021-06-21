const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const { buildSchema } = require('graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const dbURI = process.env.DB_URI;
const Event = require('./models/event');

const app = express();

app.use(express.json());

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: process.env.USER,
    pass: process.env.PASS
}).then(res => app.listen(3000))
.catch(err => console.log(err));

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        scalar Date
        type Event{
            _id:ID!
            title:String!
            description:String!
            price:Float!
            date:String!
        }

        input EventInput{
            title:String!
            description:String!
            price:Float!
            date:String!
        }

        type RootQuery{
            events: [Event!]!
        }

        type RootMutation{
            createEvent(eventInput:EventInput):Event
        }

        schema {
            query: RootQuery
            mutation:RootMutation,
            
        }
    `,),
    rootValue: {
        events: async() => {
            try {
                const results = await Event.find().lean();
                console.log(results);
                return results;
            } catch (error) {
                throw error;
            }

        },
        createEvent: async ({ eventInput }) => {
            // const event = {
            //     _id: Math.random(),
            //     title: eventInput.title,
            //     description: eventInput.description,
            //     price: +eventInput.price,
            //     date: new Date(eventInput.date)
            // }
            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date)
            });
            try {
                const res = await event.save();
                return res;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})