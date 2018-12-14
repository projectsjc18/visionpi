
// Dependencies
// -----------------------------------------------------
var fs              = require('fs');
//var https           = require('https');
var http            = require('http');
var express         = require('express');
var mongoose        = require('mongoose');
var port            = process.env.PORT || 80;
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var app             = express();
var options = {
   pfx: fs.readFileSync('certificates/visionpi.pfx'),
   passphrase: 'adminjc$%'
};
var passport	= require('passport');
var config      = require('./config/database'); 
//var server = https.createServer(options, app);
var server = http.createServer(app);
var io = require('socket.io')(server);
// Express Configuration 
// -----------------------------------------------------
// Sets the connection to MongoDB
//mongoose.connect("mongodb://localhost/MeanMapApp");

// connect to database
mongoose.connect(config.database);

// Logging and Parsing
app.use(express.static(__dirname + '/public'));                 // sets the static files location to public 
app.use('/bower_components',  express.static(__dirname + '/bower_components')); //  Use BowerComponents 
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({extended: true}));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());
//Allow CORS
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Authorization');
  //console.log('solicitud' + req.headers.authorization);
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Use the passport package in our application
app.use(passport.initialize());
// pass passport for configuration
require('./config/passport')(passport);
// Routes
// ------------------------------------------------------
require('./app/routes.js')(app,passport,io,config);
// Users
//app.use('/users', require('./app/controllers/users.controller')(config));


// Listen
// -------------------------------------------------------
server.listen(port);
//app.listen(port);
console.log('App listening on port ' + port);
 

