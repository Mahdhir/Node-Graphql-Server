const Event = require('../../models/event');
const User = require('../../models/user');

const { transformEvent } = require('../../helpers/merge');

const rootValue = {
    events: async () => {
        try {
            const results = await Event.find();
            // return mapOutput(results,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
            return results.map(transformEvent);
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
            const result = await event.save();
            const user = await User.findById('60d094e112a56f23807eedd7');
            if (!user) {
                throw new Error('User not found');
            }
            user.createdEvents.push(event);
            await user.save();
            // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}])
            return transformEvent(result);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
}

module.exports = rootValue;