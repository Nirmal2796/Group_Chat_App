const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authentication = async (req, res,next) => {

    try {

        const token = req.header('Auth');
        console.log("Token>>>>>>",token);
        const decrypted_user = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await User.findByPk(decrypted_user.userId);
        // console.log(decrypted_user);
        // console.log(user);
        if (user) {
            req.user = user;
            next();
        }
        else {
            throw new Error('User not found');
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err });
    }
}

// module.exports={authentication};