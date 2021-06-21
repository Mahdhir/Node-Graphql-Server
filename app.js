const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbURI = process.env.DB_URI;
const Event = require('./models/event');
const User = require('./models/user');
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

        type User{
            _id:ID!
            email:String!
        }

        input UserInput{
            email:String!
            password:String!
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
            createUser(userInput:UserInput):User
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
                date: new Date(eventInput.date),
                creator:'60d094e112a56f23807eedd7'
            });
            try {
                const res = await event.save();
                const user = await User.findById('60d094e112a56f23807eedd7');
                if(!user){
                    throw new Error('User not found');
                }
                user.createdEvents.push(event);
                await user.save()
                return res;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        createUser:async ({userInput}) => {
            try {
                const res = await User.findOne({email:userInput.email}).lean();
                if(res){
                    throw new Error('User exists already');
                }
                const hashedPassword = await bcrypt.hash(userInput.password,12);
                const user = new User({
                    email:userInput.email,
                    password:hashedPassword
                });
                const results = await user.save();
                return results;
            } catch (error) {
                throw error;
            }
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})