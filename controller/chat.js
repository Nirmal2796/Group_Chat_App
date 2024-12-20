const User = require('../models/user');
const Chat = require('../models/chat');
const Group = require('../models/group')
const sequelize = require('../util/database');
const { where, NUMBER, Op } = require('sequelize');


exports.getMessage = async (req, res) => {
    try {

        // const LastMessageID = JSON.parse(req.query.LastMessageID);

        const gid = req.params.gid;


        const messages = await Chat.findAll({
            attributes: ['id', 'message','createdAt'],
            include: [{ model: Group, attributes: ['id'] },{
                model:User, attributes:['name']
            },
            
        ],
            where: {
                // [Op.and]: [
                    // {
                        'groupId': gid
                    // },
                //     {
                //         'id': { [Op.gt]: LastMessageID }
                //     }
                // ]
            },
            order: [['createdAt', 'DESC']],
            limit: 10,
        }
        );

        const sortedMessages=messages.sort((a, b) => a.createdAt - b.createdAt); 

        // console.log(sortedMessages);
        
        res.status(200).json({ messages: sortedMessages });
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

        // console.log('GID',req.params.gid)

        const message = await req.user.createChat({
            message: message_body,
            groupId: req.params.gid
        },{ transaction: t });

        

        await t.commit();

        res.status(200).json({ message: {message} });
    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false });
    }
}