const path = require('path');
const fs = require('fs');
const http = require('http');

const express = require('express');

const cors = require('cors');
const helemt = require('helmet');
const morgan = require('morgan');


const app = express();

const server = http.createServer(app); // Create HTTP server
const io=require('socket.io')(server);

require('dotenv').config();


const bodyParser = require('body-parser');

const sequelize = require('./util/database');


const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const User_Group=require('./models/user_group');

const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const groupRouter=require('./routes/group');

const socketAuthMiddleware=require('./middleware/socketUserAuthentication');


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(helemt({ contentSecurityPolicy: false }));
app.use(morgan('combined', { stream: accessLogStream }));


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({ extended: false }));


app.use(userRouter);
app.use(chatRouter);
app.use(groupRouter);


io.use(socketAuthMiddleware.authentication);

//SOCKET IO CONNECTION 
io.on('connection',socket=>{


    // console.log('SCOKET ID:::::',socket.id);


    //ON SEND MESSAGE EVENT
    socket.on('send-message', (msg,room) => {       
        // console.log('message: ' + msg);
        data={
            message:msg,
            user:socket.user
        }
        //RECEIVE MESSAGE
        // io.emit('receive-message',data);

        console.log(room);
        io.to(room).emit('receive-message',data);
      });
      

    //JOIN ROOM
    socket.on('join-room',room=>{
        console.log(room);
        socket.join(room);
    })


    //ON DISCONNECT
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
})

User.hasMany(Chat); //one to many
Chat.belongsTo(User); //one to one

User.belongsToMany(Group, { through: User_Group });
Group.belongsToMany(User, { through: User_Group });

Group.hasMany(Chat);
Chat.belongsTo(Group);

sequelize
    .sync()
    // .sync({force:true})
    .then(result => {
        // app.listen(3000);
        server.listen(3000);
    })
    .catch(err => console.log(err));