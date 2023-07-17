const router = require('express').Router()
const bodyParser = require('body-parser').json();
const Post = require('../models/Post')
const User = require('../models/user');
const { authenticateToken } = require('../middlewares/authMiddleware')

// Create Post
router.post('/', bodyParser,authenticateToken,async(req,res)=>{
    req.body.userId = req.user._id
    const newPost = new Post(req.body)
    try{
        userCheck = await User.findById(req.user._id)
        if(!userCheck){
            return res.status(404).json(
                {
                    data: "",
                    message: "User that not exist can't create post",
                    code : 404,
                    status: "NOT FOUND",
                }
            )
        }
        newPost.username = userCheck.username        
        const savedPost = await newPost.save()
        res.status(200).json(
            {
                data: savedPost,
                message: "Post created successfully",
                code : 200,
                status: "OK",
            }
        )
    }
    catch(error){
        console.log("POST CREATE ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when create post",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
    }
})

// Update Post
router.put('/:id', bodyParser,authenticateToken, async(req,res)=>{
    try{
        const oldPost = await Post.findById(req.params.id)
        if(oldPost.userId == req.user._id || req.user.isAdmin){
                req.body.userId = req.user._id
                const updatedPost = await Post.updateOne({$set:req.body})
                res.status(200).json(
                    {
                        data: updatedPost,
                        message: "Post updated successfully",
                        code : 200,
                        status: "OK",
                    }
                )
        }
        else{
            res.status(403).json(
                {
                    data: "",
                    message: "You can only update your posts",
                    code : 403,
                    status: "FORBIDDEN",
                }
            )
        }
    }
    catch(error){
        console.log("POST UPDATE ERROR", error) 
        res.status(500).json(
            {
                data: "",
                message: "Error when update post",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            }
        )
    }
})

// Delete Post
router.delete('/:id',bodyParser,authenticateToken,async(req,res) => {
    try{
        const deletedPost = await Post.findById(req.params.id)
        if(!deletedPost){
            res.status(404).json({
                data: "",
                message: "Post not found",
                code : 404,
                status: "NOT FOUND",
            })
        }
        if(deletedPost.userId === req.user._id || req.user.isAdmin){
            await Post.findByIdAndDelete(req.params.id) 
            res.status(200).json({
                data: "",
                message: "Post deleted successfully",
                code : 200,
                status: "OK",
            })
        }else{
            res.status(403).json(
                {
                    data: "",
                    message: "You can only delete your posts",
                    code : 403,
                    status: "FORBIDDEN",
                }
            )
        }
    } 
    catch(error){
        console.log("POST DELETE ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when delete post",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
    }
})
// Like Post
router.put('/:id/like', bodyParser,authenticateToken,async (req,res)=> {
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json({
                data: "",
                message: "Post not found",
                code : 404,
                status: "NOT FOUND",
            })
        }
        if(!post.likes.includes(req.user._id)){
            await post.updateOne({$push:{likes:req.user._id}})
            res.status(200).json(
                {
                    data: "",
                    message: "Post liked",
                    code : 200,
                    status: "OK",
                }
            )
        }
        else {
            await post.updateOne({$pull:{likes:req.user._id}})
            res.status(200).json(
                {
                    data: "",
                    message: "Post disliked",
                    code : 200,
                    status: "OK",
                }
            )
        }
    }
    catch(error){
        console.log("POST LIKE ERROR", error)
        res.status(500).json(
            {
                data: "",
                message: "Error when like/dislike the post",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            }
        )
    }
})
// Get a Post
    router.get('/:id',bodyParser,authenticateToken,async(req,res)=>{
        try{
            const post = await Post.findById(req.params.id)
            if(!post){
                res.status(404).json(
                    {
                        data: "",
                        message: "Post not found",
                        code : 404,
                        status: "NOT FOUND",
                    }
                )
            }
            res.status(200).json(
                {
                    data: post,
                    message: "Post found",
                    code : 200,
                    status: "OK",
                }
            )
        }
        catch(error){
            console.log("POST GET ERROR", error)
            res.status(500).json({
                data: "",
                message: "Error when get the post",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            })
        }
    })

// Get Timeline Posts
router.get('/timeline/all', bodyParser,authenticateToken,async(req,res)=>{
    try{
        const currentUser = await User.findById(req.user._id)
        const usersPosts = await Post.find({userId:currentUser.id})
        const friendsPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                
                const posts = Post.find({userId:friendId})
                delete posts.userId
                return posts
            }
        ))

        res.status(200).json({
                data: usersPosts.concat(...friendsPosts),
                message: "timeline found",
                code : 200,
                status: "OK",
            })
        }
    catch(error){
        console.log("POST TIMELINE ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when get the timeline",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
    }
})

module.exports = router
