// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var connection = require('./database');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(Employee, done) {
        done(null, Employee);
    });

    // used to deserialize the user

    passport.deserializeUser(function(Employee, done) {
        connection.query("SELECT * FROM Employee WHERE empID = ? ",[Employee.empID], function(err, rows){
            return done(err, Employee);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            
            usernameField : 'webID',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, webID, password, done) {

            // check to see if the user trying to login already exists
            connection.query("SELECT * FROM Employee WHERE webID = ?",[webID], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That Web ID is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        empID: req.body.empID,
                        webID: req.body.webID,
                        password: bcrypt.hashSync(req.body.password, null, null),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        birthday: req.body.birthday,
                        permissionsType: req.body.permissionsType,
                        communityID: req.body.communityID,
                        floorLevel: req.body.floorLevel
                    };

                    var insertQuery = "INSERT INTO Employee ( empID, webID, password, firstName, lastName, birthday, permissionsType, communityID, floorLevel ) values (?,?,?,?,?,?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.empID, newUserMysql.webID, newUserMysql.password, newUserMysql.firstName, newUserMysql.lastName, newUserMysql.birthday, newUserMysql.permissionsType, newUserMysql.communityID, newUserMysql.floorLevel],function(err, rows) {
                        if(err) throw err;
                   
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    passport.use(
        //logs the user in securely
        'local-login',
        new LocalStrategy({

            usernameField : 'webID',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, webID, password, done) {

            connection.query("SELECT * FROM Employee WHERE webID = ?",[webID], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                //return successful user
                return done(null, rows[0]);
            });
        })
    );
};
