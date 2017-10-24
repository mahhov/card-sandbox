// dependencies
let express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');

// setup
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

app.listen(8080, function () {
    console.log('express listen 8080')
});

let con = mysql.createConnection({
    host: "localhost",
    user: "cardSandboxDbUser",
    database: "cardSandboxDb"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("mysql connect");
});

// routes
app.get('/script/:user', function (req, res) {
    let query = 'SELECT name, owner, body FROM script WHERE owner=?';
    let values = [req.params.user];
    con.query(query, values, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/script/:user/:name', function (req, res) {
    let query = 'SELECT name, owner, body FROM script WHERE name=? AND owner=?';
    let values = [req.params.name, req.params.user];
    con.query(query, values, function (err, result) {
        if (err) throw err;
        res.send(result[0]);
    });
});

app.put('/script/:user/:name', function (req, res) {
    let query = 'INSERT INTO SCRIPT (name, owner, body) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE body=?';
    let values = [req.params.name, req.params.user, req.body, req.body];
    con.query(query, values, function (err) {
        if (err) throw err;
        res.send();
    });
});

app.delete('/script/:user/:name', function (req, res) {
    let query = 'DELETE FROM script WHERE name=? AND owner=?';
    let values = [req.params.name, req.params.user];
    con.query(query, values, function (err) {
        if (err) throw err;
        res.send();
    });
});