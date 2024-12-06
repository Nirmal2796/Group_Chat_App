
const Group=require('../models/group');
const User = require('../models/user');
const User_Group=require('../models/user_group');
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid'); 

exports.createGroup=async (req,res)=>{
    const t=await sequelize.transaction();
    try{

        const group_name=req.body.group_name;
        
        // console.log(group_name);
        const uid = uuidv4();

        const group = await Group.create({
            name:group_name,
            admin:req.user.id,
            link:uid
        },{transaction:t});


        const user_group = await User_Group.create({
            groupId:group.id,
            userId:req.user.id,
            role:'admin'
        },{transaction:t})

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
        const groups=await User.findByPk(req.user.id,{
            include:{
                model:Group,
                attributes:['id','name','link']
            }
        })

    

        // console.log(groups.groups);

        res.status(200).json({ groups: groups.groups});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}


exports.joinGroup=async (req,res)=>{
    
    const t=await sequelize.transaction();
    try{

        const glink=req.params.glink;

        // const group = await Group.findOne({where:{id}})    

        const group = await Group.findOne(glink);

        if(!group){
            throw new Error('Group does not Exist');
        }

        const user_group=await User_Group.create({
            groupId:group.id,
            userId:req.user.id,
            role:'member'
        },{transaction:t});

        await t.commit();

        res.status(200).json({ user_group: user_group });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }

}