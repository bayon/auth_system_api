const express = require('express');
const router = express.Router(); 
const User = require('../models/User');
const mongoose = require('mongoose'); 
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const validate = [
    check('fullName')
        .isLength({min:2})
        .withMessage('Your full name is required'),
    check('email')
        .isEmail()
        .withMessage('provide a valid email'),
    check('password') 
        .isLength({min:6})
        .withMessage('password must be at least 6 characters.')
]


const generateToken = (user) => {
   return  jwt.sign({_id: user._id, email: user.email, fullName: user.fullName}, 'SUPERSECRET555')
}

router.get('/', (req,res) => {
    res.send('auth route blank...')
    
} )
//endpoint is actually API_HOST/api/users/users 
router.get('/users',async  (req,res) => {
   // res.send('users data not implemented yet......')
    const user = await User.find();
    console.log('user:',user);
    res.send(user)
    
} )

router.get('/profile',async  (req,res) => {
    // res.send('users data not implemented yet......')
    //try sending in auth-token as a header to get used in the verifyToken middleware 
    console.log('req.body:',req.body);
    console.log('req.query:',req.query) 
     const user = await User.find();
     console.log('user:',user);
     res.send(user)
     
 } )

router.post('/register',validate,  async (req,res) => {
    //check validation 
    const errors = validationResult(req) ;
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
    //prevent duplicate email 
    const userExist = await User.findOne({email: req.body.email});
    if ( userExist) return res.status(400).send({success:false, message:'Email already exists.'});
// {success:false, message:'Email already exists.'}
    //hash password 
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt)

    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: hashPassword
    })
    try {
        const savedUser = await user.save()
        //
        const token = generateToken(user);
        //best practice to NOT return even hashed password. 
        res.send({success:true, data:{id: savedUser._id, fullName:savedUser.fullName, email: savedUser.email}, token})
    } catch (error) {
        console.log("error:",error);
        res.status(400).send({success:false, error});
    }

    //res.send('register route.')
})

const validateLogin = [
   
    check('email')
        .isEmail()
        .withMessage('provide a valid email'),
    check('password') 
        .isLength({min:6})
        .withMessage('password must be at least 6 characters.')
]
router.post('/login',validateLogin,  async (req,res) => {
    //check validation results
    const errors = validationResult(req) ;
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
     //check if email exists.
     const user = await User.findOne({email: req.body.email});
     if (!user) return res.status(404).send({success:false, message:'User is not registered with this email.'});

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password) 
    if(!validPassword) return res.status(404).send({success:false, message:'Invalid email or password.'});

    // create and assign web token. ( npm install jsonwebtoken )
    const token = generateToken(user); //jwt.sign({_id: user._id, email: user.email}, 'SUPERSECRET555')
   // res.send('logged In...!')
    res.header('auth-token', token).send({success:true, message: 'Logged in successfully', token})
})

module.exports = router;