const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// register new user
// POST /api/users
const registerUser = asyncHandler(async(req, res) => {
    const { full_name, username, email, password, role, github, bio, techstack } = req.body

    if(!full_name || !username || !email || !password || !role || !github || !bio || !techstack) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    //Check if user exists
    const userExists = await User.findOne({email})

    if(userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create user
    const user = await User.create({
        full_name,
        username,
        email,
        password: hashedPassword,
        role,
        github,
        bio,
        techstack
    })

    if(user) {
        res.status(201).json({
            _id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            github: user.github,
            bio: user.bio,
            techstack: user.techstack,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// authenticate new user
// POST /api/login
const loginUser = asyncHandler(async(req, res) => {
    const {username, password} = req.body

    //check for username
    const user = await User.findOne({username})

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            full_name: user.full_name,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(401)
        throw new Error('Invalid credentials')
    }
})

// Get user data
// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
    const {_id, full_name, username, email, role, github, bio, techstack} = await User.findById(req.user.id)

    res.status(200).json({
        id: _id,
        full_name,
        username,
        email,
        role,
        github,
        bio,
        techstack,
    })
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}
module.exports = {
    registerUser,
    loginUser,
    getMe,
}