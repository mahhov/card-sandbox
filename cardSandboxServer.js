// *** dependencies ***

let express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');

// *** setup ***

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

app.listen(8080, () => {
    console.log('express listen 8080')
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, POST');
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

// *** routes ***

app.get('/scripts', (req, res) => {
    let query = 'SELECT name, owner, body FROM script';
    con.query(query, (err, result) => {
        if (err) throw err;
        if (result.length > 0)
            res.status(200).send(result);
        else
            res.status(204).send();
    });
});

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
    authenticate(req.get('authenticationToken'), req.params.user, (authenticated) => {
        if (!authenticated)
            res.status(403).send();
        else {
            let query = 'INSERT INTO SCRIPT (name, owner, body) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE body=?';
            let values = [req.params.name, req.params.user, req.body, req.body];
            con.query(query, values, (err) => {
                if (err) throw err;
                res.status(200).send();
            });
        }
    });
});

app.delete('/script/:user/:name', (req, res) => {
    authenticate(req.get('authenticationToken'), req.params.user, (authenticated) => {
        if (!authenticated)
            res.status(403).send();
        else {
            let query = 'DELETE FROM script WHERE name=? AND owner=?';
            let values = [req.params.name, req.params.user];
            con.query(query, values, (err, result) => {
                if (err) throw err;
                if (result.affectedRows > 0)
                    res.status(200).send();
                else
                    res.status(204).send();
            });
        }
    });
});

app.post('/user', (req, res) => {
    let token = generateToken();
    let query = 'INSERT into authentication (name, hashedPassword, token, lastActivity) VALUES (?, ?, ?, ?)';
    let values = [req.body.name, req.body.password, token, new Date()];
    con.query(query, values, (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0)
            res.status(201).send(token);
        else
            res.status(409).send();
    });
});

app.post('/token', (req, res) => {
    let token = generateToken();
    let query = 'UPDATE authentication SET token=?, lastActivity=? WHERE name=? AND hashedPassword=?';
    let values = [token, new Date(), req.body.name, req.body.password, req.body.name];
    con.query(query, values, (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0)
            res.status(200).send(token);
        else
            res.status(400).send();
    });
});

let authenticate = (authenticationToken, owner, callback) => {
    let now = new Date();
    let query = 'UPDATE authentication SET lastActivity=? WHERE name=? AND token=? AND TIMESTAMPDIFF(HOUR, lastActivity, ?) < 2';
    let values = [now, owner, authenticationToken, now];
    return con.query(query, values, (err, result) => {
        if (err) throw err;
        callback(result.affectedRows > 0);
    });
};

let generateToken = () => {
    return Math.random().toString(36).substr(2);
};

let hash = (unhashed) => {
    let hash = 0, i, chr;
    for (i = 0; i < unhashed.length; i++) {
        chr = unhashed.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash
};