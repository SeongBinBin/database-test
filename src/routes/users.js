const express = require('express')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')
const {generateToken, isAuth} = require('../../auth')

const router = express.Router()

router.post('/register', expressAsyncHandler(async (req, res, next) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        userId: req.body.userId,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
    })
    const newUser = await user.save()
    if(!newUser){
        res.status(401).json({code: 401, message: 'Invalid User Data'})
    }else{
        const {name, email, userId, isAdmin, createdAt} = newUser
        res.json({
            code: 200,
            token: generateToken(newUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

router.post('/login', expressAsyncHandler(async (req, res, next) => {
    const loginUser = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    })
    if(!loginUser){
        res.status(401).json({code: 401, message: 'Invalid Email or Password'})
    }else{
        const {name, email, userId, isAdmin, createdAt} = loginUser
        res.json({
            code: 200,
            token: generateToken(loginUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

router.get('/logout', isAuth, expressAsyncHandler(async (req, res, next) => {
    const logoutUser = await User.findByIdAndUpdate({_id: req.user._id}, {token: ""})

    if (!logoutUser) {
        return res.status(404).json({success: false, message: 'User Not Founded'})
    }else{
        return res.status(200).json({success: true, message: 'Logout Successfully !'})
    }
}))


router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        res.status(404).json({code: 404, message: 'User Not Founded'})
    }else{
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.password = req.body.password || user.password
        user.isAdmin = req.body.isAdmin || user.isAdmin
        user.lastModifiedAt = new Date()

        const updatedUser = await user.save()
        const {name, email, userId, isAdmin, createdAt} = updatedUser
        res.json({
            code: 200,
            token: generateToken(updatedUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user) {
        res.status(404).json({code: 404, message: 'User Not Founded'})
    }else{
        res.status(204).json({code: 204, message: 'User Deleted Successfully !'})
    }
}))

module.exports = router