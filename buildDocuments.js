var mongoose = require('mongoose')
const User = require('./src/models/User')
const Product = require('./src/models/Product')
const config = require('./config')

const category = ['문구', '잡화', '음식', '책', '사무용품', '의류']
let users = []

mongoose.connect(config.MONGODB_URL)
.then(() => console.log("mongodb connected ..."))
.catch(e => console.log(`failed to connect mongodb: ${e}`))

const generateRandomDate = (from, to) => {
    return new Date(
        from.getTime() + Math.random() * (to.getTime() - from.getTime())
    )
}

const selectRandomValue = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}

const generateRandomString = n => {
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const str = new Array(n).fill('a')  // 초기값이 'a'인 n개의 문자 배열
    return str.map(s => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

const createUsers = async(n, users) => {
    console.log('creating users now ... ')
    for(let i = 0; i < n; i++){
        const user = new User({
            name: generateRandomString(5),
            email: `${generateRandomString(7)}@gmail.com`,
            userId: generateRandomString(10),
            password: generateRandomString(13),
        })
        users.push(await user.save())
    }
    return users
}

const createProducts = async(n, user) => {
    console.log(`creating todos by ${user.name} now ... `)
    for(let i = 0; i < n; i++){
        const product = new Product({
            user: user._id,
            name: generateRandomString(7),
            description: generateRandomString(19),
            imgUrl: `http://www.${generateRandomString(10)}.com/${generateRandomString(10)}.png`,
            category: selectRandomValue(category),
            createdAt: generateRandomDate(new Date(2023, 1, 1), new Date()),    // 2023.05.01 부터 오늘까지의 범위
            lastModifiedAt: generateRandomDate(new Date(2023, 1, 1), new Date()),
        })
        await product.save()
    }
}

const buildData = async(users) => {
    users = await createUsers(10, users)
    users.forEach(user => createProducts(50, user))
}

buildData(users)