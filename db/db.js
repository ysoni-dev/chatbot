const mongoose= require("mongoose")
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('mongodb is connected')
}).catch((error)=>{
    console.log(error)
})