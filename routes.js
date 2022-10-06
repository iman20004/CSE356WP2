const express = require('express');
const router = express.Router()
const Users = require('./models/user-model');
const Games = require('./models/game-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerification = require("./email-server");
const crypto = require("crypto");
const auth = require('./auth');
const path = require('path');
require("dotenv").config();

router.get("/ttt/adduser", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/register.html'));
});

router.get("/ttt/login", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/login.html'));
});

router.get("/ttt/play", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/game.html'));
});

router.post("/ttt/adduser", async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body.password);
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
        return res
            .json({
                status: 'ERROR'
            })
    }

    const existingUser2 = await Users.findOne({ username: username });
    if (existingUser2) {
        return res
            .json({
                status: 'ERROR'
            })
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    //const verified = false;
    const verified = true;
    const key = crypto.randomBytes(20).toString('hex');

    const newUser = new Users({
        username, email, passwordHash, key, verified
    });

    await newUser.save().then(() => {
        //sendVerification(email, key);
        res.json({ status: "Please verify email first" })
    });
});

router.get("/ttt/verify", async (req, res) => {
    const user = await Users.findOne({ email: req.query.email, key: req.query.key })
    if (user) {
        user.verified = true
        await user.save()
        //res.redirect('/')
        res.json({status: 'OK'})
    } else {
        res.json({
            status: 'ERROR'
        });
    }
});

router.post("/ttt/login", async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await Users.findOne({ username: username });

    if (!foundUser) {
        return res.status(400).json({ status: 'ERROR'});
    }

    const match = await bcrypt.compare(password, foundUser.passwordHash);
    if (match) {
        const token = auth.signToken(foundUser);
        console.log(token)

        res.cookie("username", foundUser.username, {maxAge: 6.048e+8});
        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 6.048e+8
        })
        res.sendFile(path.join(__dirname, '/html/game.html'));

    } else {
        return res.status(400).json({ status: 'ERROR'});
    }
});

router.post("/ttt/logout", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0 
    }); 
    res.clearCookie("username", {maxAge: 0});
    res.clearCookie("currentGameId", {maxAge: 0});
    return res.status(200).json({status: 'OK'}); 
});

const serverMakeMove = (grid) => {
    let smove = Math.floor(Math.random() * grid.length);
    while(grid[smove] !== ' '){
        smove = Math.floor(Math.random() * grid.length);
    }
    grid[smove] = 'O'; 
}

const checkWinner = (grid) => {
    if(grid[0] === grid[4] && grid[4] === grid[8] && grid[0] !== " ")
        return grid[0];
    if(grid[2] === grid[4] && grid[4] === grid[6] && grid[2] !== " ")
        return grid[2];
    
    if(grid[0] === grid[1] && grid[1] === grid[2] && grid[0] !== " ")
        return grid[0];
    if(grid[3] === grid[4] && grid[4] === grid[5] && grid[3] !== " ")
        return grid[3];
    if(grid[6] === grid[7] && grid[7] === grid[8] && grid[6] !== " ")
        return grid[6];

    if(grid[0] === grid[3] && grid[3] === grid[6] && grid[0] !== " ")
        return grid[0];
    if(grid[1] === grid[4] && grid[4] === grid[7] && grid[1] !== " ")
        return grid[1];
    if(grid[2] === grid[5] && grid[5] === grid[8] && grid[2] !== " ")
        return grid[2];
    
    let winner = 'T';
    for(let i = 0;i<9;i++){
        if(grid[i] == " "){
            winner = ' ';
            break;
        }
    }
    return winner;
}

router.post("/ttt/play", async (req, res) => {
    const {move} = req.body; 
    if(move < 0 || move > 8) //verify move? idk 
        res.json({status: 'ERROR'});
    //get username from cookie and figure out if playing game
    const user = await Users.findOne({ username: req.cookies.username });
    if(!req.cookies.currentGameId){ //if no current game create new game
        let grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
        if(move){
            grid[move] = 'X'
            serverMakeMove(grid);
        }
        const newGame = new Games({grid});
        await newGame.save();
        res.cookie("currentGameId", newGame._id, {maxAge: 6.048e+8});
        user.games = [{id: newGame._id, start_date: Date.now().toLocaleString}, ...user.games]; //add game to user array
        user.save().then(() => {
            res.json({status: 'OK', grid: grid, winner: ' '});
        });
        
    } else {
        const game = await Games.findById(req.cookies.currentGameId); //get current game
        let grid = game.grid;
        let winner = ' '; 
        if(move){
            if(grid[move] === ' ') //check if move valid
                grid[move] = 'X'
            else
                res.json({status: 'ERROR'});            
            winner = checkWinner(grid);//check for winner
            if(winner === ' '){
                serverMakeMove(grid); //server makes move 
                winner = checkWinner(grid); //check for winner
            }
        }
        game.grid = grid;
        game.winner = winner; 
        if(winner !== ' '){ //if there is a winner update score and remove current game to reset
            res.clearCookie("currentGameId", {maxAge: 0}); 
            if(winner === 'X')
                user.human = user.human + 1; 
            else if(winner === 'O')
                user.wopr = user.wopr + 1; 
            else 
                user.tie = user.tie + 1; 
            user.save(); 
        }
        game.save().then(() => {
            res.json({status: "OK", grid: grid, winner: winner});
        });
    }

});

router.post("/ttt/listgames", async (req, res) => {
    const user = await Users.findOne({ username: req.cookies.username });

    res.json({status: 'OK', games: !user.games ? [] : user.games});
});

router.post("/ttt/getgame", async (req, res) => {
    const {id} = req.body; 
    const game = await Games.findById(id); 
    
    res.json({status: 'OK', grid:game.grid, winner: game.winner});
});

router.post("/ttt/getscore", async (req, res) => {
    const user = await Users.findOne({ username: req.cookies.username });
    
    res.json({status: 'OK', human: user.human, wopr: user.wopr, tie: user.tie});
});

module.exports = router;






