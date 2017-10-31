### first time db initialization

```
npm install
mysql.server start
mysql -u root
CREATE DATABASE cardSandboxDb;
CREATE USER 'cardSandboxDbUser@localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON cardSandboxDb . * TO 'cardSandboxDbUser'@'localhost';
USE cardSandboxDb
...
db-migrate up
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