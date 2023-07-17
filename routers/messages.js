const router = require('express').Router()
const bodyParser = require('body-parser').json();
const Message = require('../models/Message')
const User = require('../models/user');
const { authenticateToken } = require('../middlewares/authMiddleware')


// Send Message
router.post('/newMessage/:receiverId', bodyParser,authenticateToken, async(req, res)=> {
    try{
        // get receiver ınfo
        const receiver = await User.findById(req.params.receiverId)
        const sender = await User.findById(req.user._id)
        req.body.senderId = req.user._id
        const newMessage = new Message(req.body)
        newMessage.receiverId = req.params.receiverId
        newMessage.receiverName =  receiver.username
        newMessage.senderName = sender.username
        const savedMessage = await newMessage.save()
        const shownMessage = {
            senderName: savedMessage.senderName,
            text: savedMessage.text
        }
        res.status(200).json(
            {
                data: shownMessage,
                message: "Message send successfully",
                code : 200,
                status: "OK",
            }
        )
    }
    catch(error){
        console.log("MESSAGE SEND ERROR", error)
        res.status(500).json(
            {
                data: "",
                message: "Error when send messages",
                code : 500,
                status: "INTERNAL SERVER ERROR",
                error: error
            }
        )
    }
})

// Get all Messages from a user

router.get('/:senderId/message', bodyParser,authenticateToken,async(req, res)=> {
try{
    const message = await Message.find({
        senderId: req.params.senderId
    })
    if(!message){
        res.status(404).json(
            {
                data: "",
                message: "Message not found",
                code : 404,
                status: "NOT FOUND",
            }
        )
    }
    const filteredMessages = message.filter((element) => element.receiverId == req.user._id);
   if(filteredMessages.every((element) => element.receiverId == req.user._id)){
    const shownMessages = filteredMessages.map(({ senderName, receiverName,text,createdAt}) => ({ senderName, receiverName,text,createdAt }));

    res.status(200).json(
        {
            data: shownMessages,
            message: "All messages get successfully",
            code : 200,
            status: "OK",
        }
    )
   }  
    else{
        res.status(403).json(
            {
                data: "",
                message: "You can only see your messages",
                code : 403,
                status: "FORBIDDEN",
            }
        )
    }
}
catch(error){
    console.log("MESSAGE GET ERROR", error)
    res.status(500).json(
        {
            data: "",
            message: "Error when getting messages",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        }
    )
}
})

// Get all Messages

router.get('/allMessages/:recieverId', bodyParser,authenticateToken,async(req, res)=> {
try{
    const userId = req.user._id
    const recieverId = req.params.recieverId
    if(userId == recieverId){
        const messages = await Message.find({
            receiverId: recieverId
        })
        if(!messages){
            res.status(404).json(
                {
                    data: "",
                    message: "Message not found",
                    code : 404,
                    status: "NOT FOUND",
                }
            )
        }
        const shownMessages = messages.map(({ senderName, receiverName,text,createdAt}) => ({ senderName, receiverName,text,createdAt }));

        res.status(200).json(       
            {
                data: shownMessages,
                message: "All messages get successfully",
                code : 200,
                status: "OK",
            }
            )
    }else {
        res.status(403).json(
            {
                data: "",
                message: "You can only see your messages",
                code : 403,
                status: "FORBIDDEN",
            }
        )
    }
}
catch(error){
    console.log("ALL MESSAGE GET ERROR", error)
    res.status(500).json(
        {
            data: "",
            message: "Error when get all message",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        }
    )
}})

// Delete Message
router.delete('/delete/:id',bodyParser,authenticateToken, async(req,res)=>{
    try{
        const deletedMessage = await Message.findById(req.params.id)
        if(!deletedMessage){    
            res.status(404).json("Message not found")
        }
        if(deletedMessage.receiverId == req.user._id || deletedMessage.senderId == req.user){ 
            await deletedMessage.deleteOne()
            res.status(200).json({
                data: "",
                message: "Message deleted successfully",
                code : 200,
                status: "OK",
            })
        }else{
            res.status(403).json({
                data: "",
                message: "You can only delete your messages",
                code : 403,
                status: "FORBIDDEN",
            })
        }
    }catch(error){
        console.log("MESSAGE DELETE ERROR", error)
        res.status(500).json({
            data: "",
            message: "Error when deleting message",
            code : 500,
            status: "INTERNAL SERVER ERROR",
            error: error
        })
    }
})
module.exports = router
