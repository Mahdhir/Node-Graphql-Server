const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const bcrypt = require('bcryptjs');

const getEvents = async (eventIDs) => {
    const results = await Event.find({ _id: { $in: eventIDs } });
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return results.map(result => {
        return {
            ...result._doc,
            date: new Date(result._doc.date).toISOString(),
            creator: getUser.bind(this,result.creator)
        }
    })
}

const getEvent = async (eventID) => {
    const result = await Event.findById(eventID);
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return {
        ...result._doc,
        date: new Date(result._doc.date).toISOString(),
        creator: getUser.bind(this,result.creator)
    }
}

const getUser = async (userId) => {
    const user = await User.findById(userId);
    // return mapOutput(user,[{property:'createdEvents',type:'events'}]);
    return {
        ...user._doc,
        createdEvents: getEvents.bind(this,user._doc.createdEvents)
    }
}

const rootValue = {
    events: async () => {
        try {
            const results = await Event.find();
            // return mapOutput(results,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
            return results.map(result => {
                return {
                    ...result._doc,
                    date: new Date(result._doc.date).toISOString(),
                    creator: getUser.bind(this,result._doc.creator)
                }
            });
        } catch (error) {
            throw error;
        }

    },
    bookings: async () => {
        try {
            const results = await Booking.find();
            // return mapOutput(results,[{property:'createdAt',type:'date'},{property:'updatedAt',type:'date'}]);

            return results.map(result => {
                return {
                    ...result._doc,
                    user: getUser.bind(this,result._doc.user),
                    event: getEvent.bind(this,result._doc.event),
                    createdAt: new Date(result._doc.createdAt).toISOString(),
                    updatedAt: new Date(result._doc.updatedAt).toISOString(),
                }
            })
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
            return {
                ...result._doc,
                date: new Date(result._doc.date).toISOString(),
                creator: getUser.bind(this,result._doc.creator)
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
            const result = await user.save();
            // return mapOutput(results);
            return {
                ...result._doc
            };
        } catch (error) {
            throw error;
        }
    },
    bookEvent: async ({ eventId }) => {
        try {
            const fetchedEvent = await Event.findOne({ _id: eventId });
            if (!fetchedEvent) {
                throw new Error('Event not found');
            }
            const booking = new Booking({
                user: '60d094e112a56f23807eedd7',
                event: fetchedEvent
            });
            const result = await booking.save();
            // return mapOutput(results);
            return {
                ...result._doc,
                user: getUser.bind(this,result._doc.user),
                event: getEvent.bind(this,result._doc.event),
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString(),
            }
        } catch (error) {
            throw error;
        }

    },
    cancelBooking: async({bookingId})=>{
        try {
            const booking = await Booking.findById(bookingId).populate('event');
            if(!booking)
            throw new Error('No booking found');
            const event = {
                ...booking._doc.event._doc,
                creator:getUser.bind(this,booking._doc.event._doc.creator)
            }
            await Booking.deleteOne({_id:bookingId});
            return event;
        } catch (error) {
            
        }
    }
}

const mapOutput = (results, options = []) => {
    if (options.length == 0) {
        return {
            ...results._doc
        }
    }
    validateOptions(results._doc, options);
    let output = {
        ...results._doc
    }
    options.forEach(option => {
        output[option.property] = mapValue(results._doc, option);
    })
    console.log(output);
    return output;
}

const validateOptions = (doc, options) => {
    console.log("start validation")
    console.log(doc);
    const keys = Object.keys(doc);
    options.forEach(option => {
        if (!option.property) {
            throw new Error(`Property error`);
        }
        if (!option.type) {
            throw new Error('Type error');
        }
        if (options.pathName) {
            if (!keys.includes(options.pathName))
                throw new Error('Incorrect path')
        }
        if (options.property) {
            if (!keys.includes(options.property))
                throw new Error('Incorrect property')
        }
    })
}

const mapValue = (doc, option) => {
    const type = option.type.toLowerCase();
    const path = option.pathName ? option.pathName : option.property;
    if (type == 'date') {
        return new Date(doc[path]).toISOString();
    } else if (type == 'user') {
        return getUser(doc[path]);
    } else if (type == 'events') {
        return getEvents(doc[path]);
    } else {

    }
}

module.exports = rootValue;