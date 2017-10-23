// dependencies
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

// setup
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

app.listen(8080, function () {
    console.log('express listen 8080')
});

var con = mysql.createConnection({
    host: "localhost",
    user: "cardSandboxDbUser",
    database: "cardSandboxDb"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("mysql connect");
});

// routes
app.get('/script/', function (req, res) {
    let query = 'SELECT name, owner, body FROM script';
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/script/:name', function (req, res) {
    let query = 'SELECT name, owner, body FROM script WHERE name=?';
    let values = req.params.name;
    con.query(query, values, function (err, result, fields) {
        if (err) throw err;
        res.send(result);
    });
});

app.put('/script/:name', function (req, res) {
    let query = 'INSERT INTO SCRIPT (name, owner, body) VALUES (?, "default", ?) ON DUPLICATE KEY UPDATE body=?';
    let values = [req.params.name, req.body, req.body];
    con.query(query, values, function (err, result, fields) {
        if (err) throw err;
        res.send();
    });
});

app.delete('/script/:name', function (req, res) {
    res.send('Hello World!')
});