const config = require('./config')
const jwt = require('jsonwebtoken')
const { userInfo } = require('os')

const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
    },
    config.JWT_SECRET,
    {
        expiresIn: '1d',
        issuer: 'SeongBinBin',
    })
}

const isAuth = (req, res, next) => {
    const bearerToken = req.headers.authorization
    if(!bearerToken){
        res.status(401).json({message: 'Token Is Not Supplied'})
    }else{
        const token = bearerToken.slice(7, bearerToken.length)
        jwt.verify(token, config.JWT_SECRET, (err, userInfo) => {
            if(err && err.name === 'TokenExpiredError'){
                res.status(419).json({code: 419, message: 'Token Expired !'})
            }else if(err){
                res.status(401).json({code: 401, message: 'Invalid Token !'})
            }else{
                req.user = userInfo
                next()
            }
        })
    }
}

const isAdmin = (req, res, next) => {
    if(req.uesr && req.user.isAdmin){
        next()
    }else{
        res.status(401).json({code: 401, message: 'You Are Not Valid Admin User !'})
    }
}

module.exports = {
    generateToken,
    isAuth,
    isAdmin,
}