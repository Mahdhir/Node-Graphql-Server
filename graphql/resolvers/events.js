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
    createEvent: async ({ eventInput },req) => {
        if(!req.isAuth){
            throw new Error('Unauthenticated');
        }
        const userId = req.userId;
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(eventInput.date),
            creator: userId
        });
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const result = await event.save();
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