// Description: This file is the entry point of the application. It contains the code for creating the express server, setting up the middlewares, connecting to the database, defining the routes, and starting the server. It also contains the code for setting up the socket.io server and defining the socket.io events.

//IMPORT PATH FS HTTP
const path = require('path');
const fs = require('fs');
const http = require('http');

//IMPORT EXPRESS
const express = require('express');

//IMPORT CORS AND HELMET MORGAN
const cors = require('cors');
const helemt = require('helmet');
const morgan = require('morgan');



//IMPORT CRON 
const cron = require('cron');

const app = express();

const server = http.createServer(app); // Create HTTP server
const io = require('socket.io')(server); // Attach socket.io to the server instance


//DOTENV CONFIG
require('dotenv').config();

//IMPORT SEQUELIZE
const sequelize = require('./util/database');


//BODYPARSER
const bodyParser = require('body-parser');


//IMPORT MODELS
const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const User_Group = require('./models/user_group');
const archivedChat = require('./models/archivedChat');

//IMPORT ROUTES
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const groupRouter = require('./routes/group');

//IMPORT SOCKET AUTHENTICATION MIDDLEWARE
const socketAuthMiddleware = require('./middleware/socketUserAuthentication');


//CREATE ACCESS LOG FILE
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


//MIDDLEWARES
app.use(helemt({ contentSecurityPolicy: false })); //Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(morgan('combined', { stream: accessLogStream }));//Morgan is a HTTP request logger middleware for Node.js


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
})); //CORS

app.use(express.static(path.join(__dirname, 'public')));//Serve static files

app.use(bodyParser.json({ extended: false }));//Body parser


//ROUTES
app.use(userRouter);
app.use(chatRouter);
app.use(groupRouter);

//SOCKET AUTHENTICATION MIDDLEWARE
io.use(socketAuthMiddleware.authentication);


//SOCKET IO CONNECTION 
io.on('connection', socket => {

    // console.log('SCOKET ID:::::',socket.id);

    //ON SEND MESSAGE EVENT
    socket.on('send-message', (msg, room, fileURL) => {
        // console.log('message: ' + msg);
        data = {
            message: msg,
            user: socket.user,
            fileURL: fileURL
        }
        //RECEIVE MESSAGE
        // io.emit('receive-message',data);
        io.to(room).emit('receive-message', data);
    });


    //JOIN ROOM
    socket.on('join-room', room => {
        console.log(room);
        socket.join(room);
    })


    //ON DISCONNECT
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

})


//ASSOCIATIONS
User.hasMany(Chat); //one to many
Chat.belongsTo(User); //one to one

User.belongsToMany(Group, { through: User_Group });
Group.belongsToMany(User, { through: User_Group });

Group.hasMany(Chat);
Chat.belongsTo(Group);




// Creating a cron job which runs on every 10 second
const job = new cron.CronJob('* 59 23 * * *', async function () {

    console.log('You will see this message every 10 second');

    const t = await sequelize.transaction();

    try {

        const currentDate=new Date();

    
        const oldChat = await Chat.findAll({
            where: {
                createdAt: {
                    [Op.lt]: new Date(currentDate - 24 * 60 * 60 * 1000)
                }
            }
        });


        oldChat.forEach(chat => {

            archivedChat.create({
                message: chat.message,
                userId: chat.userId,
                groupId: chat.groupId
            });

            chat.destroy();
        }, { transaction: t });

        await t.commit();


    }
    catch (err) {
        await t.rollback();
        console.log(err);
    }


}, // This function is executed when the job is started
null, // This function is executed when the job stops
true, // Start the job right now
'Asia/Kolkata' // Time zone of this job.
);



//listen to the server
sequelize
    .sync()
    // .sync({force:true})
    .then(result => {
        // app.listen(3000);
        server.listen(3000);//LISTEN TO SERVER
    })
    .catch(err => console.log(err));