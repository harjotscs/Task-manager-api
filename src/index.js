const express=require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/tasks')


const app=express()


// app.use((req,res,next)=>{
//     res.status(503).send('Server Under Maintenance')
// })
// app.use((req,res,next)=>{
//     visits=visits+1
//     next()
// })

var visits=0

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const port=process.env.PORT


// app.get('/visits',async(req,res)=>{
//     res.send('visits='+visits)
// })

const multer=require('multer')
const upload=multer({
    dest:'images',
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please Upload a word'))
        }
        cb(undefined,true)
    }
})


app.post('/upload',upload.single('pdf'),(req,res)=>{
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

app.listen(port,()=>{
    console.log('Server Running on Port '+ port)
})

