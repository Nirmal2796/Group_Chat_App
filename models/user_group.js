const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const User_Group=sequelize.define('user_group',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    role:{
        type:Sequelize.STRING,
        allowNull:false
    }
});

module.exports=User_Group;