
const Group=require('../models/group');


exports.createGroup=async (req,res)=>{
    const t=await sequelize.transaction();
    try{

        const group_name=req.body.group_name;
        
        const group = await req.user.createGroup({
            name: group_name
        }, { transaction: t });

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

        const groups=await Group.findAll({where:{userId: req.user.id}});

        res.status(200).json({ groups: groups });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}
