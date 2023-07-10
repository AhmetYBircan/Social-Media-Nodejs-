const mongoose = require('mongoose')

const MessagesSchema = new mongoose.Schema({   
 senderId: {
        type: String,
        required: true
 },
 senderName: {
        type: String,
 },
  receiverId:{
        type: String,
  },
  receiverName:{
        type: String,
  },
   text:{
        type: String,
        required: true,
   }
},
    {
    timestamps: true
    })

module.exports = mongoose.model('Message',MessagesSchema)