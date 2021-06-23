const Booking = require('../../models/booking');
const Event = require('../../models/event');

const { transformEvent,transformBooking } = require('../../helpers/merge');

const rootValue = {
    bookings: async () => {
        try {
            const results = await Booking.find();
            // return mapOutput(results,[{property:'createdAt',type:'date'},{property:'updatedAt',type:'date'}]);

            return results.map(transformBooking)
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
            return transformBooking(result);
        } catch (error) {
            throw error;
        }

    },
    cancelBooking: async ({ bookingId }) => {
        try {
            const booking = await Booking.findById(bookingId).populate('event');
            if (!booking)
                throw new Error('No booking found');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: bookingId });
            return event;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = rootValue;