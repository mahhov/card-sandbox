### first time db initialization

```
npm install
mysql.server start
mysql -u root
CREATE DATABASE cardSandboxDb;
CREATE USER 'cardSandboxDbUser@localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON cardSandboxDb . * TO 'cardSandboxDbUser'@'localhost';
USE cardSandboxDb
CREATE TABLE script (name VARCHAR(20), owner VARCHAR(20), body TEXT), PRIMARY KEY(name, owner);
```

### get up locally
```
mysql.server start
nodemon // alternately: node cardSandboxServer.js
```

### access table
```
mysql -u root
USE cardSandboxDb
select * from script;
```