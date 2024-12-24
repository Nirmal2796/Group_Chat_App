const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const ArchivedChat =sequelize.define('archivedChat',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    message:{
        type:Sequelize.STRING,
        allowNull:false
    },
    userId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    groupId:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
});

module.exports=ArchivedChat ;