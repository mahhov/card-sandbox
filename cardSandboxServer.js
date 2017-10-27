// dependencies
let express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');

// setup
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

app.listen(8080, () => {
    console.log('express listen 8080')
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

let con = mysql.createConnection({
    host: 'localhost',
    user: 'cardSandboxDbUser',
    database: 'cardSandboxDb'
});

con.connect((err) => {
    if (err) throw err;
    console.log('mysql connect');
});

// routes
app.get('/script/:user', (req, res) => {
    let query = 'SELECT name, owner, body FROM script WHERE owner=?';
    let values = [req.params.user];
    con.query(query, values, (err, result) => {
        if (err) throw err;
        if (result.length > 0)
            res.status(200).send(result);
        else
            res.status(204).send();
    });
});

app.get('/script/:user/:name', (req, res) => {
    let query = 'SELECT name, owner, body FROM script WHERE name=? AND owner=?';
    let values = [req.params.name, req.params.user];
    con.query(query, values, (err, result) => {
        if (err) throw err;
        if (result.length > 0)
            res.status(200).send(result[0]);
        else
            res.status(204).send();
    });
});

app.put('/script/:user/:name', (req, res) => {
    let query = 'INSERT INTO SCRIPT (name, owner, body) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE body=?';
    let values = [req.params.name, req.params.user, req.body, req.body];
    con.query(query, values, (err) => {
        if (err) throw err;
        res.status(200).send();
    });
});

app.delete('/script/:user/:name', (req, res) => {
    let query = 'DELETE FROM script WHERE name=? AND owner=?';
    let values = [req.params.name, req.params.user];
    con.query(query, values, (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0)
            res.status(200).send();
        else
            res.status(204).send();
    });
});