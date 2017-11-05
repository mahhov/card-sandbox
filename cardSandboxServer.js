// *** dependencies ***

const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();

// *** setup ***

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('express listen', port)
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, POST');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authenticationToken');
    next();
});

const db = pgp(process.env.DATABASE_URL || 'postgres://manukhovanesian@localhost:5432/cardsandboxdb');

// *** routes ***

app.get('/scripts', (req, res) => {
    const query = 'SELECT name, owner, body FROM script';
    db.many(query).then((data) => {
        res.status(200).send(data);
    }).catch(() => {
        res.status(204).send();
    });
});

app.get('/script/:user', (req, res) => {
    const query = 'SELECT name, owner, body FROM script WHERE owner=$1';
    const values = [req.params.user];
    db.many(query, values).then((data) => {
        res.status(200).send(data);
    }).catch(() => {
        res.status(204).send();
    });
});

app.get('/script/:user/:name', (req, res) => {
    const query = 'SELECT name, owner, body FROM script WHERE name=$1 AND owner=$2';
    const values = [req.params.name, req.params.user];
    db.many(query, values).then((data) => {
        res.status(200).send(data);
    }).catch(() => {
        res.status(204).send();
    });
});

app.put('/script/:user/:name', (req, res) => {
    authenticate(req.get('authenticationToken'), req.params.user).then(() => {
        const query = 'INSERT INTO SCRIPT (name, owner, body) VALUES ($1, $2, $3) ON CONFLICT (name, owner) DO UPDATE SET body=$3 RETURNING name';
        const values = [req.params.name, req.params.user, req.body];
        db.one(query, values).then(() => {
            res.status(200).send();
        }).catch((x) => {
            console.log(x, query, values);
        });
    }).catch(() => {
        res.status(403).send();
    });
});

app.delete('/script/:user/:name', (req, res) => {
    authenticate(req.get('authenticationToken'), req.params.user).then(() => {
        const query = 'DELETE FROM script WHERE name=$1 AND owner=$2 RETURNING name';
        const values = [req.params.name, req.params.user];
        db.one(query, values).then(() => {
            res.status(200).send();
        }).catch(() => {
            res.status(204).send();
        });
    }).catch(() => {
        res.status(403).send();
    });
});

app.post('/user', (req, res) => {
    const token = generateToken();
    const query = 'INSERT into authentication (name, hashedpassword, token, lastactivity) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)';
    const values = [req.body.name, req.body.password, token];
    db.none(query, values).then(() => {
        res.setHeader('Content-Type', 'text/plain');
        res.status(201).send(token);
    }).catch(() => {
        res.status(409).send();
    });
});

app.post('/token', (req, res) => {
    const token = generateToken();
    const query = 'UPDATE authentication SET token=$1, lastactivity=CURRENT_TIMESTAMP WHERE name=$2 AND hashedpassword=$3 RETURNING name';
    const values = [token, req.body.name, req.body.password];
    db.one(query, values).then(() => {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(token);

    }).catch(() => {
        res.status(400).send();
    });
});

const authenticate = (authenticationToken, owner) => {
    const query = "UPDATE authentication SET lastactivity=CURRENT_TIMESTAMP WHERE name=$1 AND token=$2 AND lastactivity > CURRENT_TIMESTAMP - INTERVAL '2 HOURS' RETURNING name";
    const values = [owner, authenticationToken];
    return db.one(query, values);
};

const generateToken = () => {
    return Math.random().toString(36).substr(2);
};

const hash = (unhashed) => {
    let hash = 0, i, chr;
    for (i = 0; i < unhashed.length; i++) {
        chr = unhashed.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash
};