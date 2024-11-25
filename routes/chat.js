const express=require('express');

const router=express.Router();

const chatController=require('../controller/chat');

const userAuthentication=require('../middleware/userAuthentication');


router.post('/send-message',userAuthentication.authentication,chatController.sendMessage);

router.get('/get-messages',userAuthentication.authentication,chatController.getMessage);

module.exports=router;