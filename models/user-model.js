const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        userName: {type: String, required: true},
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        key: { type: String, required: true },
        verified: { type: Boolean, required: true },
        games: { type: [{id: {type: String, required: true}, start_date: {type: String, required: true}}], required: false}, 
        score: {type: {
            human: {type: Number, required: true}, 
            wopr: {type: Number, required: true}, 
            tie: {type: Number, required: true}
        }, required: false}
    },
    { timestamps: true },
)

module.exports = mongoose.model('User', UserSchema)