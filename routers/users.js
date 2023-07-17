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
                return res.status(500).json({
                    data: "",
                    message: "Error when update the password",
                    code : 500,
                    status: "INTERNAL SERVER ERROR",
                    error: error
                })
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            res.status(200).json({
                    data: user,
                    message: "User updated successfully",
                    code : 200,
                    status: "OK",
                })
        }
        catch(error){
            console.log("USER UPDATE ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when update the user",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    }
    else{
        return res.status(403).json(
            {
                data: "",
                message: "You can only update your account",
                code : 403,
                status: "FORBIDDEN",
            }
        )
    }
} )
// Delete User
router.delete('/:id', bodyParser,authenticateToken,async (req,res) => {
    if(req.user._id == req.params.id || req.user.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json(
                {
                    data: "",
                    message: "User deleted successfully",
                    code : 200,
                    status: "OK",
                }
            )
        }
        catch(error){
            console.log("USER DELETE ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when delete the user",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    }
    else{
        return res.status(403).json(
            {
                data: "",
                message: "You can only delete your account",
                code : 403,
                status: "FORBIDDEN",
            }
        )
    }
} )

// Get a User
router.get('/:id', bodyParser,authenticateToken,async(req,res) => {
    try{
        const user = await User.findById(req.params.id)
        const {password, updatedAt,isAdmin, ...other} = user._doc
        if(!user){
            res.status(404).json( {
                data: "",
                message: "User not found",
                code : 404,
                status: "NOT FOUND",
            }
            )
        }
        res.status(200).json({
            data: other,
            message: "User get successfully",
            code : 200,
            status: "OK",
        } )
    } 
    catch(error){
        console.log("USER GET ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when get the user",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
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
                res.status(403).json(
                    {
                        data: "",
                        message: "You already follow this account",
                        code : 403,
                        status: "FORBIDDEN",
                    }
                )
            }
        res.status(200).json({
        data: user.username +" has been followed successfully",
        message: "User followed successfully",
        code : 200,
        status: "OK",
        })
        }
        catch(error){
            console.log("USER FOLLOW ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when follow the user",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    } 
    else{ 
        res.status(403).json(
            {
                data: "",
                message: "You can't follow yourself",
                code : 403,
                status: "FORBIDDEN",
            }
        )
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
                res.status(403).json(
                    {
                        data: "",
                        message: "This account is not followed already",
                        code : 403,
                        status: "FORBIDDEN",
                    }
                ) 
            }
        res.status(200).json(
        {
            data: user.username +" has been unfollowed successfully",
            message: "User followed successfully",
            code : 200,
            status: "OK",
        })
        }
        catch(error){
            console.log("USER UNFOLLOW ERROR", error) 
            res.status(500).json({
                data: "",
                message: "Error when unfollow the user",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    }
    else{
        res.status(403).json(
            {
                data: "",
                message: "You can't unfollow yourself",
                code : 403,
                status: "FORBIDDEN",
            }
        )
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
            res.status(200).json(
            {
                data: "Followers of "+ user.username+ " :"+ followersUsernames,
                message: " Followers getted successfully",
                code : 200,
                status: "OK",
            }
            )
            
        }
        catch(error){
            console.log("GET FOLLOWERS ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when get the followers",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
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
            res.status(200).json(
            {
                data: "Followings of "+user.username +" :"+ followingsUsernames,
                message: "Followings getted successfully",
                code : 200,
                status: "OK",
            })
            
        }
        catch(error){
            console.log("GET FOLLOWERS ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when get the followings",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    })

    // Get a Profile
    router.get('/profile/:username', bodyParser, async(req,res)=> {
    try{
        console.log("req.params.username=>", req.params.username)
        const profileUser = await User.findOne({username: req.params.username})
        if(!profileUser){
            res.status(404).json(
                {
                    data: "",
                    message: "User not found",
                    code : 404,
                    status: "NOT FOUND",
                }
            )
        }
        const {password, updatedAt,isAdmin,__v, ...other} = profileUser._doc
        console.log("other=>", other)
        const userPosts = await Post.find({userId: profileUser._id})

            let {_id,userId, ...otherPosts} = userPosts  
        res.status(200).json({
                    data: other + otherPosts,
                    message: "Profile getted successfully",
                    code : 200,
                    status: "OK",
                })
    }
    catch(error){
        console.log("GET PROFILE ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when get the profile",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
    } 
    })
module.exports = router 
