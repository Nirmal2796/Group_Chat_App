const Sib = require('sib-api-v3-sdk');

const Group = require('../models/group');
const User = require('../models/user');

const User_Group = require('../models/user_group');
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

exports.createGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {

        const group_name = req.body.group_name;

        // console.log(group_name);
        const uid = uuidv4();

        const group = await Group.create({
            name: group_name,
            admin: req.user.id,
            link: uid
        }, { transaction: t });


        const user_group = await User_Group.create({
            groupId: group.id,
            userId: req.user.id,
            role: 'admin'
        }, { transaction: t })

        await t.commit();

        res.status(200).json({ group: group });

    }
    catch (err) {
        await t.rollback();
        res.status(500).json({ success: false, message: err });
    }
}


exports.getGroups = async (req, res) => {
    try {

        console.log(req.user.id);
        const groups = await User.findByPk(req.user.id, {
            include: {
                model: Group,
                attributes: ['id', 'name', 'link']
            }
        })



        // console.log(groups.groups);

        res.status(200).json({ groups: groups.groups });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}


exports.getJoinGroup = async (req, res) => {
    const glink = req.params.glink;


    // If user is authenticated, redirect to the route that handles POST for joining the group
    res.redirect(`/join-group/${glink}/process`);
}

exports.joinGroup = async (req, res) => {

    const t = await sequelize.transaction();
    try {

        const glink = req.params.glink;

        console.log('in join group')

        // const group = await Group.findOne({where:{id}})    

        const group = await Group.findOne({ where: { link: glink } });

        if (!group) {
            return res.status(404).json({ message: 'Group does not exist' });
        }

        const joinedGroup = await User_Group.findOne({
            where: {
                [Op.and]:[
                    {
                        groupId:group.id
                    },
                    {
                       role:{
                        [Op.or]:['admin','member']
                       }
                    }
                ]
            }
        })

        if(joinedGroup){
            // console.log(joinedGroup);
            return res.status(409).json({ message: 'You are already a member of this group' });
        }


        const user_group = await User_Group.create({
            groupId: group.id,
            userId: req.user.id,
            role: 'member'
        }, { transaction: t });

        await t.commit();

        res.status(200).json({ user_group: user_group });


    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false, message:err});
    }

}

exports.inviteViaEmail = async (req, res) => {

    const t = await sequelize.transaction();
    try {


        const email = req.body.invite_email;
        const glink = req.body.glink;

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        // const uid = uuidv4();

        // const user = await User.findOne({ where: { email } });

        // if (user) {

        const sender = {
            email: 'nirmalgadekar2796@gmail.com',
            name: 'Group Chat App'
        }

        const receivers = [
            {
                email: email
            }
        ]

        // console.log(receivers[0]);

        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Group Invitation',
            textContent: `${glink}`
        })

        await t.commit();

        res.status(200).json({ success: true });


        // }
        // else {
        //     res.status(404).json({ message: 'User not found'});
        // }


    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
}