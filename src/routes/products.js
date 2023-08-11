const express = require('express')
const Product = require('../models/Product')
const expressAsyncHandler = require('express-async-handler')
const {isAuth} = require('../../auth')

const mongoose = require('mongoose')
const {Types: {ObjectId}} = mongoose

const router = express.Router()

router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const products = await Product.find({user: req.user._id}).populate('user')
    if(products.length === 0){
        res.status(404).json({code: 404, message: 'Fail To Find Products !'})
    }else{
        res.json({code: 200, products})
    }
}))

router.get('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const product = await Product.findOne({
        user: req.user._id,
        _id: req.params.id
    })
    if(!product){
        res.status(404).json({code: 404, message: 'Product Not Found'})
    }else{
        res.json({code: 200, product})
    }
}))

router.post('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const searchedProduct = await Product.findOne({
        user: req.user._id,
        name: req.body.name,
    })
    if(searchedProduct){
        res.status(204).json({code: 204, message: 'Product You Want To Create Already Exists In DB !'})
    }else{
        const product = new Product({
            user: req.user._id,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            imgUrl: req.body.imgUrl,
        })
        const newProduct = await product.save()
        if(!newProduct){
            res.status(401).json({code: 401, message: 'Failed To Save Product'})
        }else{
            res.status(201).json({
                code: 201,
                message: 'New Product Created',
                newProduct
            })
        }
    }
}))

router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const product = await Product.findOne({
        user: req.user._id,
        _id: req.params.id
    })
    if(!product){
        res.status(404).json({code: 404, message: 'Product Not Found'})
    }else{
        product.name = req.body.name || product.name
        product.description = req.body.description || product.description
        product.category = req.body.category || product.category
        product.imgUrl = req.body.imgUrl || product.imgUrl
        product.lastModifiedAt = new Date()

        const updatedProduct = await product.save()
        res.json({
            code: 200,
            message: 'Product Updated',
            updatedProduct
        })
    }
}))

router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const product = await Product.findOne({
        user: req.user._id,
        _id: req.params.id
    })
    if(!product){
        res.status(404).json({code: 404, message: 'Product Not Found'})
    }else{
        await Product.deleteOne({
            user: req.user._id,
            _id: req.params.id
        })
        res.status(204).json({code: 204, message: 'Product Deletd Successfully !'})
    }
}))

router.get('/group/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(!req.user.isAdmin){
        res.status(401).json({code: 401, message: 'You Are Not Authorized To Use This Service !'})
    }else{
        const docs = await Product.aggregate([
            {
                $group: {
                    _id: `$${req.params.field}`,
                    count: {$sum: 1}
                }
            }
        ])

        console.log(`Number Of Group: ${docs.length}`)
        docs.sort((d1, d2) => d1._id - d2._id)
        res.json({code: 200, docs})
    }
}))

router.get('/group/mine/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    const docs = await Product.aggregate([
        {
            $match: {user: new ObjectId(req.user._id)}
        },
        {
            $group: {
                _id: `$${req.params.field}`,
                count: {$sum: 1}
            }
        }
    ])

    console.log(`Number Of Group: ${docs.length}`)
    docs.sort((d1, d2) => d1._id - d2._id)
    res.json({code: 200, docs})
}))

router.get('/group/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(!req.user.isAdmin){
        res.status(401).json({code: 401, message: 'You Are Not Admin'})
    }else{
        if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt'){
            const docs = await Product.aggregate([
                {
                    $group: {
                        _id: {year: {$year: `$${req.params.field}`}, month: {$month: `$${req.params.field}`}},
                        count: {$sum: 1}
                    }
                },
                {$sort: {_id: 1}}
            ])

            console.log(`Number Of Group: ${docs.length}`)
            docs.sort((d1, d2) => d1._id - d2._id)
            res.json({code: 200, docs})
        }else{
            res.status(204).json({code: 204, message: 'No Content'})
        }
    }
}))

router.get('/group/mine/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt'){
        const docs = await Product.aggregate([
            {
                $match: {user: new ObjectId(req.user._id)}
            },
            {
                $group: {
                    _id: {year: {$year: `$${req.params.field}`}, month: {$month: `$${req.params.field}`}},
                    count: {$sum: 1}
                }
            },
            {$sort: {_id: 1}}
        ])

        console.log(`Number Of Group: ${docs.length}`)
        docs.sort((d1, d2) => d1._id - d2._id)
        res.json({code: 200, docs})
    }else{
        res.status(204).json({code: 204, message: 'No Content'})
    }
}))

module.exports = router