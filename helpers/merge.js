const Event = require('../models/event');
const User = require('../models/user');
const { dateToString } = require('../helpers/date');

const getEvents = async (eventIDs) => {
    const results = await Event.find({ _id: { $in: eventIDs } });
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return results.map(transformEvent);
}

const getEvent = async (eventID) => {
    const result = await Event.findById(eventID);
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return transformEvent(result);
}

const getUser = async (userId) => {
    const user = await User.findById(userId);
    // return mapOutput(user,[{property:'createdEvents',type:'events'}]);
    return {
        ...user._doc,
        createdEvents: getEvents.bind(this, user._doc.createdEvents)
    }
}

const transformBooking = (booking) => {
    return {
        ...booking._doc,
        user: getUser.bind(this, booking._doc.user),
        event: getEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt),
    }
}

const transformEvent = (event) => {
    return {
        ...event._doc,
        date: dateToString(event._doc.date),
        creator: getUser.bind(this, event.creator)
    }
}

module.exports = { getEvent, getEvents, getUser, transformBooking, transformEvent }