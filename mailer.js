const nodemailer = require("nodemailer");

const mailFunction = (mailContent)=>{
    try{
        
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
            
              user:process.env.MAILER_ACCOUNT,
              pass: process.env.MAILER_PASSWORD
            }
          });
                
          async function sendMail() {
            try{
            const info = await transporter.sendMail(mailContent);
            }
            catch(error){
                console.log("SEND MAIL ERROR", error)
            }
        }
        sendMail(mailContent);
    }
    catch(error){
        console.log("MAIL ERROR", error)
    }
}
module.exports = mailFunction
