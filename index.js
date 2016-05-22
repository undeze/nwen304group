//var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
/* To support login with facebook */
//var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var fb = require('connect-ensure-login');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

/* To support the database */
var pg = require('pg'); 

const crypto = require('crypto');
const hash = crypto.createHash('sha256');

var connectionString = process.env.DATABASE_URL;
var client = new pg.Client(connectionString);



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

passport.use(new LocalStrategy(
  function(username, password, done) {
  	console.log("passport.use");
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

var urlencodedparser = require('body-parser').urlencoded({extended: false});

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


app.get('/login/local',
	function(req,res){
		res.render('pages/local');
});



app.get('/index',
	require('connect-ensure-login').ensureLoggedIn(),
	function(req, res){
		res.render('pages/index', { user: req.user });
	});

app.get('/logout/facebook', fb.ensureLoggedIn(),
	function(req, res){
		req.logout();
		res.redirect('/');
});


app.get('/profile',
	require('connect-ensure-login').ensureLoggedIn(),
	function(req, res){
		res.render('pages/profile', { user: req.user });
	});

app.get('/db', function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err){
			console.error('Could not connect to the database');
			console.error(err);
			return;
		}
		var query = client.query("SELECT * FROM people;", function(error, result){
				done();
				if(error){
				}
		});
		var results = [];
			// Stream results back one row at a time
			query.on('row',function(row){
				results.push(row);
			});
			// After all data is returned, close connection and return results
			query.on('end',function(){
				client.end();
				res.json(results);
			});
		});
})

app.post('/signup', urlencodedparser, function(req,res){
		console.log('here, signing up');
		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		console.log('username: ' + username);

		console.log('email: ' + email);
		console.log('password: ' + password);

		pg.connect(connectionString, function (err, client, done){
			if(err){
					console.log('Could not connect to postgresql on signup',err);
					return;
			}
			hash.update(password);
			var encrypted = hash.digest('hex');
			var query = client.query("insert into members values (default,'" + username + 
				"','" + encrypted + "','" + email + "');", function(error, result){
					done();
					if(error){}

				});
		 });
}); 


app.post('/login', urlencodedparser, function(req,res){
		console.log('/login called');
		//var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		console.log('username: ' + username);

		//console.log('email: ' + email);
		console.log('password: ' + password);


		pg.connect(connectionString, function (err, client, done){
			if(err){
					console.log('Could not connect to postgresql on signup',err);
					return;
			}
			hash.update(password);
			var encrypted = hash.digest('hex');
			var passwordHash = client.query("select password from members where email = '" + email + "';", function(error, result){
					done();
					if(error){}

				});
			console.log(passwordHash);
		});

		
}); 





app.listen(port, function() {
	console.log('Node app is running on port: '+port);
});