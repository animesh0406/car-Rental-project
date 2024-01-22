if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require('path');
const Data = require('./database/model');
const mongoose = require('mongoose');
const User = require('./DataBase/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/car-rent';
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Database Connected !!!");
    })
    .catch(error => {
        console.log("Oh no MONGOOSE Error !!!");
        console.log(error);
    });


// parse json request body
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// serving static files
app.get('/', (req, res) => {
    try {
        if (!req.cookies || !req.cookies.token) throw Error();
        jwt.verify(req.cookies.token, JWT_SECRET);
        res.sendFile(path.join(__dirname, '/client/index-loggedIn.html'));
    } catch (err) {
        res.sendFile(path.join(__dirname, '/client/index.html'));
    }
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/register.html'));
});


// middlewares
const authValidator = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const verified = jwt.verify(token, JWT_SECRET);

        req.user = verified.user;
        req.username = verified.username;

        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
}


// api routes for backend
app.post('/api/rent', authValidator, async (req, res) => {
    try {
        const { location, pickupDate, returnDate, carName, carPrice } = req.body;
        const data = new Data({ username: req.username, location, pickupDate, returnDate, carName, carPrice });
        await data.save();
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json(err);
    }
});

app.get('/api/getData', async (req, res) => {
    const data = await Data.find({});
    res.json(data);
});


// api for login/register
const JWT_SECRET = 'some-hard-screte-key-@-123';

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(401).json(`Wrong username or password.`);
        }
        const passwordCorrect = await bcrypt.compare(
            password,
            existingUser.passwordHash
        );
        if (!passwordCorrect)
            return res.status(401).json(`Wrong username or password.`);


        // sign the token
        const token = jwt.sign(
            {
                user: existingUser._id,
                username: existingUser.username
            },
            JWT_SECRET
        );

        // send the token in a HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            // secure: true,
            // sameSite: "none",
        }).status(200).redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json('something went wrong !');
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // hash the password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // save a new user account to the db
        const newUser = new User({
            username,
            email,
            passwordHash
        });

        const savedUser = await newUser.save();

        // sign the token
        const token = jwt.sign(
            {
                user: savedUser._id,
                username: savedUser.username
            },
            JWT_SECRET
        );

        // send the token in a HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            // secure: true,
            // sameSite: "none",
        }).status(200).redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json(false);
    }
});

app.get('/api/logout', (req, res) => {
    return res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        // secure: true,
        // sameSite: "none",
    }).status(200).redirect('/');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('listening on port 5000');
});
