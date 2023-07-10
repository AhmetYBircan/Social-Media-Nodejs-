const router = require('express').Router()
const bodyParser = require('body-parser').json();
const Post = require('../models/Post')
const User = require('../models/user');

// Create Post

router.post('/', bodyParser, async(req,res)=>{
    const newPost = new Post(req.body)
    try{
        userCheck = await User.findById(req.body.userId)
        if(!userCheck){
            return res.status(404).json("User that not exist can't create post")
        }
        newPost.username = userCheck.username        
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    }
    catch(error){
        console.log("POST CREATE ERROR", error)
        res.status(500).json(error)
    }
})
// Update Post

router.put('/:id', bodyParser, async(req,res)=>{
    try{
        const oldPost = await Post.findById(req.params.id)
        if(oldPost.userId === req.body.userId){
                const updatedPost = await Post.updateOne({$set:req.body})
                res.status(200).json("Post Updated Successfully")
        }
        else{
            res.status(403).json("You can only update your posts")
        }
    }
    catch(error){
        console.log("POST UPDATE ERROR", error) 
        res.status(500).json(error)
    }
})
// Delete Post

router.delete('/:id',bodyParser, async(req,res) => {
    try{
        const deletedPost = await Post.findById(req.params.id)
        if(!deletedPost){
            res.status(404).json("Post not found")
        }
        if(deletedPost.userId === req.body.userId){
            await Post.findByIdAndDelete(req.params.id) 
            res.status(200).json("Post deleted successfully")
        }else{
            res.status(403).json("You can only delete your posts")
        }
    } 
    catch(error){
        console.log("POST DELETE ERROR", error)
        res.status(500).json(error)
    }
})
// Like Post
router.put('/:id/like', bodyParser, async (req,res)=> {
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json("Post not found")
        }
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}})
            res.status(200).json("Post liked")
        }
        else {
            await post.updateOne({$pull:{likes:req.body.userId}})
            res.status(200).json("Post disliked")
        }
    }
    catch(error){
        console.log("POST LIKE ERROR", error)
        res.status(500).json(error)
    }
})
// Get a Post
    router.get('/:id', bodyParser, async(req,res)=>{
        try{
            const post = await Post.findById(req.params.id)
            if(!post){
                res.status(404).json("Post not found")
            }
            res.status(200).json(post)
        }
        catch(error){
            console.log("POST GET ERROR", error)
            res.status(500).json(error)
        }
    })

// Get Timeline Posts

router.get('/timeline/all', bodyParser, async(req,res)=>{
    try{
        const currentUser = await User.findById(req.body.userId)
        const usersPosts = await Post.find({userId:currentUser.id})
        const friendsPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                
                const posts = Post.find({userId:friendId})
                delete posts.userId
                return posts
            }
        ))

        res.status(200).json(usersPosts.concat(...friendsPosts))
        }
    catch(error){
        console.log("POST TIMELINE ERROR", error)
        res.status(500).json(error)
    }
})

module.exports = router
