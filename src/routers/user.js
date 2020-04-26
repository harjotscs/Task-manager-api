const express=require('express')
const router= new express.Router()
const auth=require('../middleware/auth')
const User=require('../models/user')
const bodyParser=require('body-parser')
const multer=require('multer')
const sharp=require('sharp')
const {welcomeEmail,goodByeEmail}=require('../emails/account.js')


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

router.get('/users/login',(req,res)=>{
    res.render('login.hbs')
})


router.get('/users',async (req,res)=>{
    
    const user=await User.find({})
    res.send(user)
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user||!user.avatar)
        {
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

// router.get('/users/:id',async (req,res)=>{
//     const _id=req.params.id
//     try{
//         const user=await User.findById({_id})
//             if(!user){
//                 return res.status(404).send('User Not Found')
//             }
//             res.send(user)
    
//     }catch(e){
//         res.status(500).send('User not found')
//     }
// })


router.post('/users',async (req,res)=>{
    const user=new User(req.body)

    try{
        const token=await user.generateAuthToken()
        await user.save()
        welcomeEmail(req.body.Email,req.body.name)
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/user/login',async (req,res)=>{
    try{
        
        const user=await User.findByCredentials(req.body.Email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    }
    catch(e){
        res.status(400).send({"Error":"User Not Found"})
    }
})

router.post('/user/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return req.token!==token.token
        })
       await req.user.save()
       res.status(200).send('Successfully Logged out')
    }catch(e){
        res.status(500).send()
    }
})

router.post('/user/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send('Successfully Logged out of all Devices')
    }catch(e){
        res.status(500).send()
    }
})

const upload=multer({
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/))
        {
            cb(new Error("Please upload either a png, jpg or jpeg type"))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({Error:error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.status(200).send()
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()
        goodByeEmail(req.user.Email,req.user.name)
    return res.send(req.user)
    }
    catch(e)
    {
        return res.status(500).send(e)
    }
})


router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','password','Email','age']
    const isValid= updates.every((update)=>allowedUpdates.includes(update))

    if(!isValid)
    {
        return res.status(400).send('Not Allowed')
    }

    try{
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        res.send(req.user)

    }catch(e){

        res.status(400).send(e)
    }
})

module.exports=router

