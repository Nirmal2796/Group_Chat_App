const express=require('express');

const router=express.Router();

const groupController=require('../controller/group');

const userAuthentication=require('../middleware/userAuthentication');


router.post('/create-group',userAuthentication.authentication,groupController.createGroup);

router.get('/get-groups',userAuthentication.authentication,groupController.getGroups);  

router.get('/join-group/:glink',userAuthentication.authentication,groupController.getJoinGroup);

router.post('/join-group/:glink/process',userAuthentication.authentication,groupController.joinGroup);

router.post('/invite',userAuthentication.authentication,groupController.inviteViaEmail);


module.exports=router;
