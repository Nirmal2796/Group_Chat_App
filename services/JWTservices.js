const jwt=require('jsonwebtoken');

const generateToken=(id, ispremiumuser)=>{
    return jwt.sign({userId:id},process.env.TOKEN_SECRET);
}


module.exports={
    generateToken
};