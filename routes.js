const express = require('express');
const router = express.Router()
const Users = require('./models/user-model');
const Games = require('./models/game-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const auth = require('./auth');
const path = require('path');

router.get("/adduser", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/register.html'));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/login.html'));
});

router.get("/play", (req, res) => {
    res.sendFile(path.join(__dirname, '/html/game.html'));
});

router.post("/adduser", async (req, res) => {
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
    const verified = false;
    const key = crypto.randomBytes(20).toString('hex');

    const newUser = new Users({
        username, email, passwordHash, key, verified
    });

    await newUser.save().then(() => {
        sendVerification(email, key);
        res.json({ status: 'OK' })
    });
});

const sendVerification = (email, key) => {
    const { exec } = require("child_process");
    var link = `\"http://209.94.56.64/verify/?email=${email}&key=${key}\"`
    var command = `echo ${link} | mail -s=Verification Link --encoding=quoted-printable ${email}`;
    console.log(link);
    exec(command, (error,stdout,stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

router.get("/verify", async (req, res) => {
    console.log("in verify route");
    console.log(req.query.key);
    const user = await Users.findOne({ key: req.query.key })
    if (user) {
        user.verified = true
        console.log("verified user!")
        await user.save();
        return res.json({status: 'OK'});
    } else {
        console.log('wrong key');
        return res.json({
            status: 'ERROR'
        });
    }
});


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await Users.findOne({ username: username });

    if (!foundUser) {
        console.log('no user');
        return res.json({ status: 'ERROR'});
    }

    if (!foundUser.verified) {
        console.log('not verified');
        return res.json({ status: 'ERROR'});
    }

    const match = await bcrypt.compare(password, foundUser.passwordHash);
    if (match) {
        const token = auth.signToken(foundUser);
        console.log(token);

        res.cookie("username", foundUser.username, {maxAge: 6.048e+8});
        return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 6.048e+8
        }).json({status: 'OK'});
    } else {
        return res.json({ status: 'ERROR'});
    }
});

router.post("/logout", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0 
    }); 
    res.clearCookie("username", {maxAge: 0});
    res.clearCookie("currentGameId", {maxAge: 0});
    return res.json({status: 'OK'}); 
});






// .............................................. GAME LOGIC ..................................................

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

router.post("/ttt/play", auth.verify, async (req, res) => {
    const {move} = req.body; 
    if(move < 0 || move > 8) //verify move? idk 
        res.json({status: 'ERROR'});
    //get username from cookie and figure out if playing game
    const user = await Users.findOne({ username: req.cookies.username });
    if(!req.cookies.currentGameId){ //if no current game create new game
        let grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
        let winner = ' ';
        if(move !== null){
            grid[move] = 'X'
            serverMakeMove(grid);
        }
        const newGame = new Games({grid, winner});
        await newGame.save();
        res.cookie("currentGameId", newGame._id, {maxAge: 6.048e+8});
        user.games = [{id: newGame._id, start_date: Date.now().toLocaleString()}, ...user.games]; //add game to user array
        user.save().then(() => {
            res.json({status: 'OK', grid: grid, winner: ' '});
        });
        
    } else {
        const game = await Games.findById(req.cookies.currentGameId); //get current game
        let grid = game.grid;
        let winner = ' '; 
        if(move !== null){
            if(grid[move] === ' ') //check if move valid
                grid[move] = 'X'
            else
                return res.json({status: 'ERROR'});            
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

router.post("/listgames", auth.verify, async (req, res) => {
    const user = await Users.findOne({ username: req.cookies.username });

    res.json({status: 'OK', games: user.games});
});

router.post("/getgame", auth.verify, async (req, res) => {
    const {id} = req.body; 
    const game = await Games.findById(id); 
    if(!game){
        return res.json({status: 'ERROR'}); 
    }
    
    return res.json({status: 'OK', grid: game.grid, winner: game.winner});
});

router.post("/getscore", auth.verify, async (req, res) => {
    const user = await Users.findOne({ username: req.cookies.username });
   
    res.json({status: 'OK', human: user.human, wopr: user.wopr, tie: user.tie});
});

module.exports = router;






