const express = require('express');
const router = express.Router()
const Users = require('./models/user-model');
const Games = require('./models/game-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerification = require("./email-server");
const crypto = require("crypto");

router.post("/ttt/adduser", async (req,res) => {
    const { username, email, password } = req.body;
    console.log(req.body.password);
    const existingUser = await Users.findOne({ email: email });
        if (existingUser) {
            return res
                .json({
                    status: 'ERROR'
                })
        }

    const existingUser2 = await Users.findOne({ userName: username });
    if (existingUser2) {
        return res
            .json({
                status: 'ERROR'
            })
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const verified = false;
    const key = crypto.randomBytes(20).toString('hex');

    const newUser = new Users({
        username, email, passwordHash, key, verified
    });    

    await newUser.save().then(() => {
        sendVerification(email,key);
        res.json({status: 'OK'})
    });
});

router.get("/ttt/verify", async (req,res) => {
    const user  = await Users.findOne({ email: req.query.email, key: req.query.key})
    if (user) {
        user.verified = true
        await user.save()
        res.redirect('/')
    } else {
        res.json({
            status: 'ERROR'
        });
    }
});

router.post("/ttt/login", (req,res) => {

    
});

router.post("/ttt/logout", (req,res) => {
    
});

router.post("/ttt/play", (req,res) => {

});

router.post("/ttt/listgames", (req,res) => {
    
});

router.post("/ttt/getgame", (req,res) => {
    
});

router.post("/ttt/getscore", (req,res) => {
    
});

module.exports = router;






