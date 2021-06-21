const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

const getEvents = async (eventIDs) => {
    const res = await Event.find({ _id: { $in: eventIDs } });
    return res.map(result => {
        return {
            ...result._doc,
            date: new Date(result._doc.date).toISOString(),
            creator: getUser(result.creator)
        }
    })
}

const getUser = async (userId) => {
    const user = await User.findById(userId);
    return {
        ...user._doc,
        createdEvents: getEvents(user._doc.createdEvents)
    }
}

const rootValue = {
    events: async () => {
        try {
            const results = await Event.find();
            return results.map(result => {
                return {
                    ...result._doc,
                    date: new Date(result._doc.date).toISOString(),
                    creator: getUser(result._doc.creator)
                }
            });
        } catch (error) {
            throw error;
        }

    },
    createEvent: async ({ eventInput }) => {
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(eventInput.date),
            creator: '60d094e112a56f23807eedd7'
        });
        try {
            const res = await event.save();
            const user = await User.findById('60d094e112a56f23807eedd7');
            if (!user) {
                throw new Error('User not found');
            }
            user.createdEvents.push(event);
            await user.save();
            console.log({ ...res })
            return {
                ...res._doc,
                date: new Date(res._doc.date).toISOString(),
                creator: getUser(res._doc.creator)
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    createUser: async ({ userInput }) => {
        try {
            const res = await User.findOne({ email: userInput.email }).lean();
            if (res) {
                throw new Error('User exists already');
            }
            const hashedPassword = await bcrypt.hash(userInput.password, 12);
            const user = new User({
                email: userInput.email,
                password: hashedPassword
            });
            const results = await user.save();
            return results;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = rootValue;