let async = require('async');

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db, callback) {
    return db.createTable('script', {
        name: {type: 'VARCHAR(20)', primaryKey: true},
        owner: {type: 'VARCHAR(20)', primaryKey: true},
        body: 'TEXT'
    }).then(() => {
        return db.createTable('authentication', {
            name: {type: 'VARCHAR(20)', primaryKey: true},
            hashedpassword: 'VARCHAR(20)',
            token: 'VARCHAR(20)',
            lastactivity: 'TIMESTAMP'
        });
    });
};

exports.down = function (db, callback) {
    return db.dropTable('script').then(() => {
        db.dropTable('authentication');
    });
};

exports._meta = {
    'version': 1
};
