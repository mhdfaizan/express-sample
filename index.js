const mysql = require('mysql');
const express = require('express');
const jwt = require('jsonwebtoken');
var app = express();
const bodyparser = require('body-parser');

const sampledata = require('./mock-data/sample-data');


app.use(bodyparser.json());

const port = 3000;

// enter your connection details here
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Inseyab@123',
    database: 'world'
});

// initial connection to MySQL Database
mysqlConnection.connect(
    err => {
        if (!err) {
            console.log("DB connection succeeded!");
        } else {
            console.log("DB connection failed!\n Error: " + JSON.stringify(err, undefined, 2));
        }
    }
);

// configuring port for Express server
app.listen(port, () => console.log('Express server is running at port ' + port));


// format of token
// Authorization: Bearer <access_token>

// function to verify token
const verifyToken = (req, res, next) => {
    // get auth header value
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        //split at the space
        const bearer = bearerHeader.split(' ');
        // get token from array
        const bearerToken = bearer[1];
        // set the token
        req.token = bearerToken;
        // next middleware
        next();
    } else {
        res.sendStatus(403);
    }
};


// get sample data from mock file
app.get('/sample', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.send({
                sampledata,
                authData
            });

        }
    });
});

// get all countries data
app.get('/countries', (req, res) => {
    mysqlConnection.query('SELECT * FROM country', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log("Error: " + JSON.stringify(err, undefined, 2));
        }
    })
});

// get single country data
app.get('/countries/:code', (req, res) => {
    mysqlConnection.query('SELECT * FROM country WHERE Code = ?', [req.params.code], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log("Error: " + JSON.stringify(err, undefined, 2));
        }
    })
});

// login api for generating token
app.post('/login', (req, res) => {
    //creating a mock user
    const user = {
        id: 1,
        username: 'brad',
        email: 'brad@gmail.com'
    }
    jwt.sign({
        user: user
    }, 'secretKey', (err, token) => {
        res.send({
            token: token
        });
    });
});