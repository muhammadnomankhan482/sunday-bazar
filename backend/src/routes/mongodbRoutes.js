const mongoose = require('mongoose')
const { applyTimestamps } = require('../models/Product')
const express = require("express")

const rout = express.Router

const userSchema = mongosse.schema({
    userId:{
        type: Number,
        unique: true,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    socialMedia:{
        type: Array,

    },
}

    {
        timesta
    }

)


const User = mongoose.model("User" , "userSchema")


router.get("/", async (req , res) =>{
    const users = await User.find()
    users.length > 0 ? res.status(200).json(users) : res.status(404).json({message: "No users found"})
})

router.post("/" , async (req , res) =>{
    const user = User.create({
        userId:1,
        firstName:"John",
        lastName:"Doe",
        email:"john.doe@example.com",
        password:"password123"
        
    })

    res.json("user created successfully", {...user, password:"nahi bataonga"
    })
    const {userId , firstName , lastName , email , password} = req.body
    const user = new User({userId , firstName , lastName , email , password})
    await user.save()
    res.status(201).json(user)
})
module.exports = router