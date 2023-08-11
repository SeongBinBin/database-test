var express = require('express')
var app = express()
var cors = require('cors')
var logger = require('morgan')
var mongoose = require('mongoose')
var usersRouter = require('./src/routes/users')
var productsRouter = require('./src/routes/products')
var config = require('./config')

var corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true
}

mongoose.connect(config.MONGODB_URL)
.then(() => console.log('MONGODB CONNECTED ... '))
.catch(e => console.log(`FAILED TO CONNECT MONGODB: ${e}`))

app.use(cors(corsOptions))
app.use(express.json())
app.use(logger('tiny'))

app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)

app.use((req, res, next) => {
    res.status(404).send("Page Not Found")
})
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send("Internal Server Error")
})
app.listen(5000, () => {
    console.log('Server Is Running On Port 5000')
})