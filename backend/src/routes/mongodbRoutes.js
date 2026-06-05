const mongoose = require('mongoose')
const express = require("express")

const router = express.Router()

const userSchema = mongoose.Schema({
    userId: {
        type: Number,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    socialMedia: {
        type: Array,
    },


},
    {
        timestamps: true,
    }
)

const User = mongoose.model("User" , userSchema)


router.get("/" , async (req , res) =>{
  const users =  await User.find()

  res.json(users).statusCode(200)
})


router.post("/" , async (req , res) =>{
    const user = User.create({
        userId: 5,
        firstName: 'Arham',
        lastName: 'Ali',
        email: 'arhamali12345@gmail.com',
        passwordHash: '1234567890',
    })

    res.status(201).json({message: '"user created successfully!" ' , ...user, passwordHash: 'nh btaunga'})
})

module.exports = router
