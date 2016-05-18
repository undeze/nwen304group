var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

/* To support login with facebook */
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: 874576735997925, //process.env.CLIENT_ID,
    clientSecret: '0e8803d67c827a86c9f4cb470c79f8ed', //process.env.CLIENT_SECRET,
    callbackURL: 'https://nwen304group6.herokuapp.com/login/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


app.set('port', process.env.PORT);

app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/');

// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('views', __dirname + '/');
//app.set('nwen304group6', __dirname);

app.set('view engine', 'ejs');


// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());



app.get('/', function(req,res){
  res.render('pages/home',{user: req.user});
});


app.get('/login',
  function(req, res){
    res.render('pages/login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/index');
  });

app.get('/index',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('pages/index', { user: req.user });
  });

app.get('/banner.jpg',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('pages/banner.jpg', { user: req.user });
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('pages/profile', { user: req.user });
  });



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});