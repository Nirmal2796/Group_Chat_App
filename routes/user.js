const express=require('express');

const router=express.Router();

const userController=require('../controller/user');


router.post('/signup',userController.postSignupUser);

router.post('/login',userController.postLoginUser);

module.exports=router;
