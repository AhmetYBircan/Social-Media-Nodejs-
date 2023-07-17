const User = require('../models/user')
const jwt = require('jsonwebtoken')

    var authenticateToken = async(req,res,next) => {
        try {
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]
    
        if(!token){
            res.status(401).json({
                success: false,
                message: "UNAUTHORIZED(TOKEN NOT FOUND)"
            })
        }
            req.user = await User.findById(
                jwt.verify(token, process.env.JWT_SECRET).id
            )     
        next()
    }
    catch(error){  
        console.log("AUTH MIDDLEWARE ERROR", error)
        res.status(500).json({
            success: false,
            message: "AUTH ERROR",
            error: error
        })
    } 
    
}
module.exports = {
    authenticateToken,
  };
