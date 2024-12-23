const express=require('express');
const multer = require('multer'); // For handling file uploads

const router=express.Router();

const chatController=require('../controller/chat');

const userAuthentication=require('../middleware/userAuthentication');

// Multer setup
const upload = multer();

router.post('/send-message/:gid',userAuthentication.authentication,chatController.sendMessage);

router.get('/get-messages/:gid',userAuthentication.authentication,chatController.getMessage);

router.post('/upload-to-s3/:gid',userAuthentication.authentication,upload.single('file'),chatController.uploadToS3);

module.exports=router;
