const bcrypt = require('bcryptjs');
const User = require('../../models/user');


const rootValue = {
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
    }
}

module.exports = rootValue;