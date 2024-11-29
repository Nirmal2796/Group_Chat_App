const User = require('../models/user');
const Chat = require('../models/chat');
const Group = require('../models/group')
const sequelize = require('../util/database');
const { where, NUMBER, Op } = require('sequelize');


exports.getMessage = async (req, res) => {
    try {

        const LastMessageID = JSON.parse(req.query.LastMessageID);

        // console.log('LastMessageID', LastMessageID)


        // const messages = await Chat.findAll({
        //     attributes: ['id', 'message'],
        //     include: [{ model: User, attributes: ['name'] }],
        //     where: {
        //         'id': { [Op.gt]: LastMessageID }
        //     },
        //     limit: 10
        // }
        // );

        // const groups=await Group.findAll({where:{userId: req.user.id}});

        const m=await  Chat.findAll({
            attributes: ['id', 'message'],
            include: [{ model: User, attributes: ['name'] }],
            include: [{ model: Group, attributes: ['name'] }],
            where: {
                'id': { [Op.gt]: LastMessageID }
            },
            where:{
                userId: req.user.id
            },
            limit: 10
        }
        );

       

        res.status(200).json({ messages: messages });
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