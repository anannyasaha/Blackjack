//Code that creates and handles a sqlite3 database

const sqlite3 = require('sqlite3').verbose();
//creates/loads a new database
const db = new sqlite3.Database('./database/model/users.db', (err) => {
    if (err) {
        console.error('Error while connecting to database: ', err);
    } else {
        console.log('Connected to or created SQLite database');
    }
});

//Just ignore the fact passwords are encoded in plain text formatting, clearly the secure choice of passwords
db.serialize(() => {
    db.run('DROP TABLE users')
      .run(`CREATE TABLE users(userId INTEGER PRIMARY KEY,
                                username TEXT,
                                password TEXT,
                                wins NUMERIC DEFAULT 0,
                                losses NUMERIC DEFAULT 0,
                                ties NUMERIC DEFAULT 0,
                                message TEXT)`)
    .run(`INSERT INTO users(username, password, wins, losses, ties, message) VALUES(?, ?, ?, ?, ?, ?)`,
        ['admin', 'sasageyo', 0, 0, 0, 'The first one']);
});
//Returns a record of all non password fields from user
function getUsers(callback){
    db.all('SELECT username, wins, losses, ties, message FROM users', (err, users) => {
        if (err){
            console.error('Error getting usernames');
        }
        else{
            callback(users);
        }
    });
}
//Returns a user's win/loss/tie record
function getRecords(user, callback){
    db.all('SELECT wins, losses, ties FROM users WHERE username = ?', 
    [user], (err, scores) => {
        if (err){
            console.error('Error getting usernames');
        }
        else{
            callback(scores);
        }
    });
}
// Not a getter, finds if user's user name and password exists
function getUsernames(user, pass, callback){
    
     db.all('SELECT username, password FROM users', function(err, users){
        var r = false;
        if (err){
            console.error('Error getting results');
        }
        else{
            users.forEach((result)=>{
                if(result.username==user){
                    if(result.password==pass){
                        r = true;
                    }
                } 
            });
        }
        callback(r);
    });
    
}
//Checks if username exists in data
function checkUsername(user, callback) {
    db.all('SELECT username FROM users', function (err, users) {
        var r = false;
        if (err) {
            console.error('Error getting results');
        }
        else {
            users.forEach((result) => {
                console.log(result.username)
                if (result.username == user) {
                    r = true;
                }
            });
        }
        callback(r);
    });
}
//Registers a new user into the database
function registerUser(user, pass) {
    db.run('INSERT INTO users(username, password) VALUES(?, ?)', [user, pass], (err) => {
        if (err) {
            console.error('Error inserting into database: ', err);
        }
    });
}
//Updates a user's score
function updateRankings(user, win, loss, tie, callback) {
    db.run('UPDATE users SET wins = ?, losses = ?, ties = ? WHERE username = ?', 
           [win, loss, tie, user], (err) => {
        if (err) {
            console.error('Error updating user score: ', err);
        } else {
            callback();
        }
    });
}

//Model exports so the server can use them
module.exports.getUsers = getUsers;
module.exports.getUsernames = getUsernames;
module.exports.checkUsername = checkUsername;
module.exports.registerUser = registerUser;
module.exports.updateRankings = updateRankings;
module.exports.getRecords = getRecords;