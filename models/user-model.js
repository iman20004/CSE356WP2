const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        username: {type: String, required: true},
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        key: { type: String, required: true },
        verified: { type: Boolean, required: true },
        games: { type: [{id: {type: String, required: true}, start_date: {type: String, required: true}}], required: false}, 
        human: {type: Number, default: 0}, 
        wopr: {type: Number, default: 0}, 
        tie: {type: Number, default: 0}
    },
    { timestamps: true },
)

module.exports = mongoose.model('User', UserSchema)