const mongoose = require('mongoose')

const {Schema} = mongoose
const {Types: {ObjectId}} = Schema

const productSchema = new Schema({
    category: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imgUrl: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now,
    },
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product