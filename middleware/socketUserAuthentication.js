const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authentication = async (socket,next) => {

    try {

        const token = socket.handshake.auth.token;

        if (!token) {
            const err = new Error('Authentication error: Token missing');
            return next(err);
        }

        console.log("Token>>>>>>",token);
        const decrypted_user = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await User.findByPk(decrypted_user.userId);
        // console.log(decrypted_user);
        // console.log(user);
        if (user) {
            
        // Attach user data to the socket object for future use
            socket.user = user;
            next(); // Allow connection
        }
        else {
            throw new Error('User not found');
            return next(err);
        }

    }
    catch (err) {
        console.error('Authentication failed:', err.message);
        next(new Error('Authentication error: Invalid token'));
    }
}
