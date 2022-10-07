const express = require('express')
const cookieParser = require('cookie-parser')

const PORT = 80; 
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.use(function(req, res, next) {
    res.setHeader('X-CSE356', '6307b8b558d8bb3ef7f6d8ff')
    next();
});

const serverRoutes = require('./routes.js')
app.use('/', serverRoutes);

const db = require('./db.js');
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));