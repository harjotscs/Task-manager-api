const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const tasks=require('../models/task')

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.length<6){
                throw new Error("Password length must be more than 6 characters")
            }
            if(value.toLowerCase().includes('password'))
            {
                throw new Error("Password Cannot Contain password")
            }
        }
    },
    
    Email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Email is invalid")
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
            {
                throw new Error("Age can't be Negative")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
    
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})

userSchema.statics.findByCredentials=async(Email,password)=>{
    const user= await User.findOne({Email})
    if(!user)
    {
        throw new Error('No User associated with this Email')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        throw new Error('Wrong Credentials Entered')
    }
    return user
}

userSchema.methods.toJSON=function(){
    const user=this
    const userObject= user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken= async function (){
    const user=this
    const token= jwt.sign({ _id:user._id.toString()},process.env.JWT_SECRET,{expiresIn:'1day'})
    user.tokens=user.tokens.concat({token})

    const tokenLength=user.tokens.length.toString()
    
    if (tokenLength>5)
    {
        var count=1
        user.tokens=user.tokens.filter((token)=>{
            if (count===1)
            {
                count=count+1
                return false
            }
            return true
            
        })
    }
    await user.save()
    return token
}

//Hashing before saving
userSchema.pre('save',async function(next){
    const user=this
    
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8)
    }

    next()
})

userSchema.pre('remove', async function(next){
    const user=this
    await tasks.deleteMany({owner:user._id})
    next()
})


const User=mongoose.model('User',userSchema)



module.exports=User