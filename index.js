const express = require('express')
const cookieParser = require('cookie-parser')

const PORT = 80; 
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

const serverRoutes = require('./routes.js')
app.use('/api', serverRoutes)

const db = require('./db.js');
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));