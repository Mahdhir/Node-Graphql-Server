const DataLoader = require('dataloader');
const Event = require('../models/event');
const User = require('../models/user');
const { dateToString } = require('../helpers/date');

const eventLoader = new DataLoader((eventIds) => {
    return getEvents(eventIds);
});

const userLoader = new DataLoader((userIds) => {

    return User.find({_id: {$in:userIds}});
});

const getEvents = async (eventIDs) => {
    const results = await Event.find({ _id: { $in: eventIDs } });
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return results.map(transformEvent);
}

const getEvent = async (eventID) => {
    const result = await eventLoader.load(eventID.toString());
    // return mapOutput(res,[{property:'date',type:'date'},{property:'creator',type:'user'}]);
    return result;
}

const getUser = async (userId) => {
    const user = await userLoader.load(userId.toString());
    // return mapOutput(user,[{property:'createdEvents',type:'events'}]);
    return {
        ...user._doc,
        createdEvents: eventLoader.loadMany.bind(this, user._doc.createdEvents)
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