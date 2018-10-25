// Dependencies
var mongoose        = require('mongoose');
var jwt             = require('jwt-simple');
var User            = require('../app/models/usermodel'); 
var Message         = require('../app/models/messagemodel'); 
var Optionsmenu     = require('../app/models/optionmodel');
var Gpx             = require('../app/models/gpxmodel')

// Opens App Routes
module.exports = function(app,passport,io,config) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/api/users', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function(err, users){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(users);
        });
    });
    
    // route to a restricted info (GET http://localhost:8080/api/memberinfo)
    app.get('/api/userinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
        var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                name: decoded.name
            }, function(err, user) {
                if (err) throw err;
 
                if (!user) {
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
                }
            });
        } else {
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
    });

    // route to a restricted info (GET http://localhost:8080/users/privileges)
    app.get('/users/privileges', passport.authenticate('jwt', { session: false}), function(req, res) {
        //console.log(req.headers);
        var token = getToken(req.headers);
        var optionsmenu = [];
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                username: decoded.username
            }, function(err, user) {
                if (err) throw err;
 
                if (!user) {
                    console.log("Authentication failed. User not found.");
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    console.log('Welcome in the member area ' + user.username + '!');
                    if (user.perfil = 'Administrador') {
                        optionsmenu = [Optionsmenu.user,Optionsmenu.localization,Optionsmenu.surveillance] ;
                    }
                    console.log(optionsmenu[0].url + ',' + optionsmenu[0].icon);
                    res.send(optionsmenu);
                    //onfocus=\"buscar.value=' ';\"
                    //res.json({success: true, priv: 'Welcome in the member area ' + user.username + '!'});
                }
            });
        } else {
            console.log("No token provided.");
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/api/users', function(req, res){

        // Creates a new User based on the Mongoose schema and the post bo.dy
        var newuser = new User(req.body);

        // New User is saved in the db.
        newuser.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new user
            res.json(req.body);
        });
    });
    
    
    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    app.post('/api/authenticate', function(req, res) {
        console.log('User' + req.body.usarname + '' + req.body.password);
        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) throw err;
 
            if (!user) {
                console.log('Authentication failed. User not found.');
                res.send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right create a token
                        var token = jwt.encode(user, config.secret);
                        // return the information including token as JSON
                        var usr = ({
                            _id: user._id,
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            token: token//jwt.sign({ sub: user._id }, config.secret)
                        });
                        //res.json({user: user, token: token});
                        res.send(usr);

                    } else {
                        res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                    }
                });
            }
        });
    });
    
    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/api/query/', function(req, res){

        // Grab all of the query parameters from the body.
        var lat             = req.body.latitude;
        var long            = req.body.longitude;
        var distance        = req.body.distance;
        var male            = req.body.male;
        var female          = req.body.female;
        var other           = req.body.other;
        var minAge          = req.body.minAge;
        var maxAge          = req.body.maxAge;
        var favLang         = req.body.favlang;
        var reqVerified     = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});

        // ...include filter by Max Distance (converting miles to meters)
        if(distance){

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

            // Converting meters to miles. Specifying spherical geometry (for globe)
            maxDistance: distance * 1609.34, spherical: true});
        }

        // ...include filter by Gender (all options)
        if(male || female || other){
            query.or([{ 'gender': male }, { 'gender': female }, {'gender': other}]);
        }

        // ...include filter by Min Age
        if(minAge){
            query = query.where('age').gte(minAge);
        }

        // ...include filter by Max Age
        if(maxAge){
            query = query.where('age').lte(maxAge);
        }

        // ...include filter by Favorite Language
        if(favLang){
            query = query.where('favlang').equals(favLang);
        }

        // ...include filter for HTML5 Verified Locations
        if(reqVerified){
            query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, users){
            if(err)
                res.send(err);

            // If no errors, respond with a JSON of all users that meet the criteria
            res.json(users);
        });
    });

    /* GET ALL GPX */
    app.get('/gpx/checkpoints', passport.authenticate('jwt', { session: false}), function(req, res, next) {
        var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, config.secret);
            User.findOne({
                username: decoded.username
            }, function(err, user) {
                if (err) throw err;
 
                if (!user) {
                    console.log("Authentication failed. User not found.");
                    return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
                } else {
                    Gpx.find({ fleet: user.username }, function (err, checkpoints) {
                        if (err) return next(err);
                            res.json(checkpoints);
                    });
                }
            });
        } else {
            console.log("No token provided.");
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }       
    });

    /* SAVE GPX */
    app.post('/api/gpx', function(req, res, next) {
        // Creates a new User based on the Mongoose schema and the post bo.dy
        var newgpx = new Gpx(req.body);

        // New User is saved in the db.
        newgpx.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new user
            sendPoint(req.body);
            res.json(req.body);
        });
        /*Gpx.create(req.body, function (err, post) {
            if (err) return next(err);
                sendPoint(post);
                res.json(post);
        });*/
    });

    
    /*||||||||||||||||||||||||||||||||||||||SOCKET||||||||||||||||||||||||||||||||||||||*/
    //Listen for connection
    io.on('connection', function (socket) {
        console.log('User connected');
        socket.on('disconnect', function() {
            console.log('User disconnected');
        });
        socket.on('save-gpx', function (data) {
            console.log(data);
            socket.join(data.room);
            //io.to('testroom2').emit('event',{ message: data });
            //io.emit('new-gpx', { message: data });
        });
    });
    
    sendPoint = function (data) {
        console.log(data);
        io.to(data.fleet).emit('event', { message: data });
    }

    /*||||||||||||||||||||||||||||||||||||||END SOCKETS||||||||||||||||||||||||||||||||||||||*/
    
    /* ------------------------------------------------------------------------------- */
    /* --------------- FUNCTIONS -------------------------------------*/
    getToken = function (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

};  
