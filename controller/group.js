const Sib = require('sib-api-v3-sdk');

const Group = require('../models/group');
const User = require('../models/user');

const User_Group = require('../models/user_group');
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');
const { Op, where } = require('sequelize');

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

        // console.log(req.user.id);

        const groups = await User.findByPk(req.user.id, {
            include: {
                model: Group,
                attributes: ['id', 'name', 'link']
            }
        })

        // const groups = await User.findAll({
        //     include:{
        //         model:Group
        //     }
        // })



        // console.log(groups);

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
                [Op.and]: [{
                    userId:req.user.id
                },
                    {
                        groupId: group.id
                    },
                    {
                        role: {
                            [Op.or]: ['admin', 'member']
                        }
                    }
                ]
            }
        })

        if (joinedGroup) {
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
        res.status(500).json({ success: false, message: err });
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


exports.getGroupMembers = async (req, res) => {

    try {

        const gid = req.params.gid;

        const groups = await Group.findByPk(gid, {
            include: {
                model: User,
                attributes: ['id', 'name']
            }
        })

        // console.log(groups.groups);

        res.status(200).json({ users: groups.users });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}


exports.removeGroupMembers = async (req, res) => {

    const t = await sequelize.transaction();
    try {

        const { groupId, userId } = req.body;

        const member = await User_Group.findOne({
            where: {
                [Op.and]: {
                    groupId: groupId,
                    userId: userId
                }
            }
        });

        member.destroy();

        await t.commit();

        // console.log(member);

        res.status(200).json({ member: member });
    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false });
    }


}


exports.makeAdmin = async (req, res) => {

    const t = await sequelize.transaction();

    try {

        const { groupId, userId } = req.body;

        const member = await User_Group.update({

            role: 'admin'
        },
            {
                where: {
                    [Op.and]: {
                        groupId: groupId,
                        userId: userId
                    }
                }
            });


        // console.log(member);

        res.status(200).json({ member: member });
    }
    catch (err) {
        await t.rollback()
        console.log(err);
        res.status(500).json({ success: false });
    }


}

exports.addUser = async (req, res) => {

    const t = await sequelize.transaction();
    try {

        const { email, gid } = req.body;

        console.log('in join group')

        // const group = await Group.findOne({where:{id}})    

        const group = Group.findByPk(gid);
        const user = User.findOne({ where: { email: email } });
        const joinedGroup = User_Group.findOne({
            where: {
                [Op.and]: [
                    {
                        groupId: gid
                    },
                    {
                        role: {
                            [Op.or]: ['admin', 'member']
                        }
                    }
                ]
            }
        })

        const result = await Promise.all([group, user, joinedGroup]);


        // console.log(group);
        // console.log(user);
        // console.log(result[0].id);

        if (!result[0]) {
            return res.status(403).json({ message: 'Group does not exist' });
        }

        if (!result[1]) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (result[2]) {
            // console.log(joinedGroup);
            return res.status(409).json({ message: 'You are already a member of this group' });
        }

        const user_group = await User_Group.create({
            groupId: result[0].id,
            userId: req.user.id,
            role: 'member'
        }, { transaction: t });


        await t.commit();

        res.status(200).json({ user_group: user_group });


    }
    catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ success: false, message: err });
    }

}