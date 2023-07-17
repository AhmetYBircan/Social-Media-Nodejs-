const router = require('express').Router()
const User = require('../models/user')
const bodyParser = require('body-parser').json();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middlewares/authMiddleware')
// REGISTER
router.post('/register',bodyParser,async (req,res)=> {

    try {
        const checkUserName = await User.findOne({username:req.body.username})
        const checkMail = await User.findOne({email:req.body.email})
        if(checkUserName || checkMail){
            return res.status(400).json("This username or email is already taken")
        }
        // Generate new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        // Create new user
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword
        })
        // Save user and response
        const user = await newUser.save()
        res.status(200).json(user)
    }
    catch(err){
        console.log("REGISTER ERROR",err)
    }
}) 
 
// LOGIN

router.post('/login', bodyParser, async (req,res)=> {
    try { 
        const user = await User.findOne({email:req.body.email})
        if(!user){
            return res.status(404).json("User not found")
        }
        validPassword = await bcrypt.compare(req.body.password, user.password)
        if(!validPassword){
            return res.status(400).json("Password is not correct")
        }
        const {password,__v, ...others} = user._doc
        res.status(200).json({
            UserInfo: others,
            token: createToken(user._id)
        })
    }
    catch(error){
        console.log("LOGIN ERROR",error)
    }
})
const createToken = (userId) => {
    return jwt.sign({id:userId}, process.env.JWT_SECRET, {expiresIn:'1d'})
}
module.exports = router 
