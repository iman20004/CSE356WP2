const mongoose = require('mongoose')

mongoose
    .connect('mongodb://0.0.0.0:27017/tic-tac-toe', { useNewUrlParser: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db