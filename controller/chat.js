const User = require('../models/user');
const Chat = require('../models/chat');
const sequelize = require('../util/database');


exports.getMessage = async (req, res) => {
    try {

        const messages=await Chat.findAll();

        res.status(200).json({messages:messages});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}


exports.sendMessage = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const message_body = req.body.message;

        const message = await req.user.createChat({
            message: message_body
        }, { transaction: t });

        await t.commit();

        res.status(200).json({ message: message });
    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false });
    }
}