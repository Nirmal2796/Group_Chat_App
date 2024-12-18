const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authentication = async (req, res,next) => {

    try {

        const token = req.header('Auth');

        if (!token) {
            // Preserve original URL
            //encodeURIComponent() encodes special characters in a string
            //encodeURIComponent() converts characters into percent-encoded format, where unsafe characters are replaced with % followed by their ASCII value in hexadecimal.
            //so the string can be safely used in a URL as part of a query parameter or path.

            //req.originalUrl is a property in the Express.js request object that provides the original URL that the client requested, including the query string (if any). 

            //The  res.redirect() function in Express.js is used to redirect the client (browser) to a different URL.
            //The return keyword in JavaScript is used to stop the execution of the current function and exit early.

            const redirectUrl = encodeURIComponent(req.originalUrl);
            // console.log(redirectUrl);
            return res.redirect(`/login/login.html?redirect=${redirectUrl}`);
        }

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