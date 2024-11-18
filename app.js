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

const userRouter=require('./routes/user');


const accessLogStream=fs.createWriteStream(path.join(__dirname, 'access.log'),{flags:'a'})

app.use(helemt({ contentSecurityPolicy: false }));
app.use(morgan('combined',{stream:accessLogStream}));


app.use(cors());

// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({extended:false}));


app.use(userRouter);

sequelize
.sync()
// .sync({force:true})
.then(result=>{
    app.listen(3000);
})
.catch(err=>console.log(err));