const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Group=sequelize.define('group',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    admin:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    link:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    }
});

module.exports=Group;