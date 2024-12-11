const express=require('express');

const router=express.Router();

const groupController=require('../controller/group');

const userAuthentication=require('../middleware/userAuthentication');


router.post('/create-group',userAuthentication.authentication,groupController.createGroup);

router.get('/get-groups',userAuthentication.authentication,groupController.getGroups);  

router.get('/join-group/:glink',userAuthentication.authentication,groupController.getJoinGroup);

router.post('/join-group/:glink/process',userAuthentication.authentication,groupController.joinGroup);

router.post('/invite',userAuthentication.authentication,groupController.inviteViaEmail);

router.get('/get-groupMembers/:gid',userAuthentication.authentication,groupController.getGroupMembers);

router.post('/remove-member',userAuthentication.authentication,groupController.removeGroupMembers);

router.post('/makeAdmin',userAuthentication.authentication,groupController.makeAdmin);


module.exports=router;
