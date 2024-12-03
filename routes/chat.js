const express=require('express');

const router=express.Router();

const chatController=require('../controller/chat');

const userAuthentication=require('../middleware/userAuthentication');


router.post('/send-message/:gid',userAuthentication.authentication,chatController.sendMessage);

router.get('/get-messages/:gid',userAuthentication.authentication,chatController.getMessage);

module.exports=router;
