const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GameSchema = new Schema(
    {
       grid: {type: [String], required: true},
       winner: {type: String, required: true}
    },
    { timestamps: true },
)

module.exports = mongoose.model('Game', GameSchema)