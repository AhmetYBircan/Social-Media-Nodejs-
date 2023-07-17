const express =  require('express')
const app = express()
const dotenv = require('dotenv')
const morgan = require('morgan')
const helmet = require('helmet')
const mongoose = require('mongoose')
const userRoute = require('./routers/users')
const authRoute = require('./routers/auth')
const postRoute = require('./routers/posts')
const messageRoute = require('./routers/messages')

dotenv.config()

const connectDB = async() => {
    try {
        const conn = mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB`)
    
    }
    catch (error) {
        console.log(`Error when connecting to MongoDB ${error}`)
    }
};
connectDB();
 
app.get('/', (req,res)=> {
	res.send('Home Page')
})
app.get('/user',(req,res)=>{
res.send('USERS PAGE')
})


app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/messages', messageRoute)



app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

 app.listen(3000, ()=> {

     console.log("Server is runnning on port 3000")
})