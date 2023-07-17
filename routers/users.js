const User = require('../models/user');
const bcrypt = require('bcrypt')
const router = require('express').Router()
const bodyParser = require('body-parser').json();
const Post = require('../models/Post')
const { authenticateToken } = require('../middlewares/authMiddleware')


router.get('/',(req,res)=>{
    res.send('USERS PAGE')
})

// Update User

router.put('/:id', bodyParser,authenticateToken, async (req,res) => {
    if(req.user._id == req.params.id || req?.user?.isAdmin){
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            }
            catch(error){
                console.log("PASSWORD UPDATE ERROR", error)
                return res.status(500).json(error)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            res.status(200).json("Informations updated successfully")
        }
        catch(error){
            console.log("USER UPDATE ERROR", error)
            res.status(500).json(error)
        }
    }
    else{
        return res.status(403).json(" You can only update your account")
    }
} )
// Delete User
router.delete('/:id', bodyParser,authenticateToken,async (req,res) => {
    if(req.user._id == req.params.id || req.user.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account deleted successfully")
        }
        catch(error){
            console.log("USER DELETE ERROR", error)
            res.status(500).json(error)
        }
    }
    else{
        return res.status(403).json(" You can only delete your account")
    }
} )

// Get a User
router.get('/:id', bodyParser,authenticateToken,async(req,res) => {
    try{
        const user = await User.findById(req.params.id)
        const {password, updatedAt,isAdmin, ...other} = user._doc
        if(!user){
            res.status(404).json(" User not found")
        }
        res.status(200).json(other) 
    } 
    catch(error){
        console.log("USER GET ERROR", error)
        res.status(500).json(error)
    }
})

// Follow a User
router.put('/:id/follow', bodyParser,authenticateToken,async(req,res)=> {
    if(req.user._id !== req.params.id){
        try{
                const user = await User.findById(req.params.id)
                const currentUser = await User.findById(req.user._id)
            if(!user.followers.includes(req.user._id)){
                await user.updateOne({$push:{followers:req.user._id}})
                await currentUser.updateOne({$push:{followings:req.params.id}})
            }else{
                res.status(403).json("This account is already followed")
            }
        res.status(200).json(user.username +" has been followed successfully")
        }
        catch(error){
            console.log("USER FOLLOW ERROR", error)
            res.status(500).json(error)
        }
    } 
    else{ 
        res.status(403).json("You can't follow yourself")
    }
} ) 
// Unfollow a User
router.put('/:id/unfollow', bodyParser,authenticateToken,async(req,res)=> {
    if(req.user._id !== req.params.id){
        try{
                const user = await User.findById(req.params.id)
                const currentUser = await User.findById(req.user._id)
            if(user.followers.includes(req.user._id)){
                await user.updateOne({$pull:{followers:req.user._id}})
                await currentUser.updateOne({$pull:{followings:req.params.id}})
            }else{
                res.status(403).json("This account is not followed") 
            }
        res.status(200).json(user.username +" has been unfollowed successfully")
        }
        catch(error){
            console.log("USER UNFOLLOW ERROR", error) 
            res.status(500).json(error)
        }
    }
    else{
        res.status(403).json("You can't unfollow yourself")
    }
} )

// Get Followers
    router.get('/:id/followers',bodyParser,async(req,res)=> {
        try{
            const user = await User.findById(req.params.id)
            const followersUsernames = []
            for(let i=0; i<user.followers.length; i++){
                follower = await User.findById(user.followers[i])
                followersUsernames.push(follower.username)
            }
            res.status(200).json("Followers of "+ user.username+ " :"+ followersUsernames)
            
        }
        catch(error){
            console.log("GET FOLLOWERS ERROR", error)
            res.status(500).json(error)
        }
    })
// Get Followings
    router.get('/:id/followings',bodyParser, async(req,res)=> {
        try{
            const user = await User.findById(req.params.id)
            const followingsUsernames = []
            for(let i=0; i<user.followings.length; i++){
                followings = await User.findById(user.followings[i])
                followingsUsernames.push(followings.username)
            }
            res.status(200).json("Followings of "+user.username +" :"+ followingsUsernames)
            
        }
        catch(error){
            console.log("GET FOLLOWERS ERROR", error)
            res.status(500).json(error)
        }
    })

    // Get a Profile
    router.get('/profile/:username', bodyParser, async(req,res)=> {
    try{
        console.log("req.params.username=>", req.params.username)
        const profileUser = await User.findOne({username: req.params.username})
        if(!profileUser){
            res.status(404).json("User not found")
        }
        const {password, updatedAt,isAdmin,__v, ...other} = profileUser._doc
        console.log("other=>", other)
        const userPosts = await Post.find({userId: profileUser._id})

            let {_id,userId, ...otherPosts} = userPosts  
        res.status(200).json(other + otherPosts)
    }
    catch(error){
        console.log("GET PROFILE ERROR", error)
        res.status(500).json(error)
    } 
    })
module.exports = router 
