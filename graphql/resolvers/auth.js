const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

const rootValue = {
    login: async({email,password})=>{
        const user = await User.findOne({email:email});
        if(!user)
        throw new Error('Invalid credentials');
        const isEqual = await bcrypt.compare(password,user.password);
        if(!isEqual)
        throw new Error('Invalid credentials');
        const token = jwt.sign({userId:user.id,email:user.email},process.env.JWT_SECRET_KEY,{
            expiresIn:'1h'
        });
        return {
            userId:user.id,
            token:token,
            tokenExpiration:1
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
    }
}

module.exports = rootValue;