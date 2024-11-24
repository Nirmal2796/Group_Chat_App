const path=require('path');
const fs=require('fs');

const express = require('express');

const cors=require('cors');
const helemt=require('helmet');
const morgan=require('morgan');

require('dotenv').config(); 

const app=express();

const bodyParser=require('body-parser');

const sequelize=require('./util/database');


const User=require('./models/user');
const Chat=require('./models/chat');

const userRouter=require('./routes/user');
const chatRouter=require('./routes/chat');


const accessLogStream=fs.createWriteStream(path.join(__dirname, 'access.log'),{flags:'a'})

app.use(helemt({ contentSecurityPolicy: false }));
app.use(morgan('combined',{stream:accessLogStream}));


app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({extended:false}));


app.use(userRouter);
app.use(chatRouter);

User.hasMany(Chat); //one to many
Chat.belongsTo(User); //one to one

sequelize
.sync()
// .sync({force:true})
.then(result=>{
    app.listen(3000);
})
.catch(err=>console.log(err));