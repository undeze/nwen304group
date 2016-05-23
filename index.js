//var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
/* To support login with facebook */
//var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var fb = require('connect-ensure-login');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

/* To support the database */
var pg = require('pg'); 

var http = require('http');

const crypto = require('crypto');

var connectionString = process.env.DATABASE_URL;
var client = new pg.Client(connectionString);

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new FacebookStrategy({
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
	}
));

// https://scotch.io/tutorials/easy-node-authentication-setup-and-local
passport.use(new LocalStrategy({

		usernameField: 'username',
		passwordField: 'password',
		
	},

	function(username, password, done){


		pg.connect(connectionString, function (err, client, done){
			if(err){
					console.log('Could not connect to postgresql on signup',err);
					return;
			}

			client.query("select password from members where username = '" + username + "';", function(error, result){
				done();
			if(error){
				console.log('error', error);
			}
			console.log('function in passport.use(new LocalStrategy');
			if(result.rows[0] != undefined){ // check for the case where no match is found in the table.
				console.log(result.rows[0].password);

				const hash1 = crypto.createHash('sha256');
				hash1.update(password);
				var passwordHash = hash1.digest('hex');

				if(passwordHash == result.rows[0].password){
					console.log('successful login 2, username:' + username);
					return done(null, username);
					//res.redirect('/login');
				} else {
					console.log('unsuccessful login');
					return done(null, false);//, req.flash('loginMessage', 'Oops! Wrong password.'));
					//res.redirect('/login');
				}
			}
			else {	// No match in the table
				console.log('  email not found in database');
				return done(null, false);//, req.flash('loginMessage', 'No user found.'));
				//res.redirect('/login');
			}

			client.end();

			});	
		});	

		/*
			//Query database
				
				// if there are any errors, return the error before anything else
            	if (err)
                	return done(err);

            	// if no user is found, return the message
            	if (!user)
                	return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            	// if the user is found but the password is wrong
            	if (!user.validPassword(password))
                	return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            	// all is well, return successful user
            	return done(null, user);
			}*/
		  
		

	}
));



// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));



/* Redirect http to https */
app.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https'&&process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
});

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
/*
app.post('/loginnew', loginPost);

function loginPost(req, res, next) {
  // ask passport to authenticate
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      // if error happens
      return next(err);
    }    
    if (!user) {
      // if authentication fail, get the error message that we set
      // from previous (info.message) step, assign it into to
      // req.session and redirect to the login page again to display
      req.session.messages = info.message;
      return res.redirect('/login');
    }
    // if everything's OK
    req.logIn(user, function(err) {
      if (err) {
        req.session.messages = "Error";
        return next(err);
      }
      // set the message
      req.session.messages = "Login successfully";
      return res.redirect('/');
    });
    
  })
}(req, res, next); */


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

app.get('/signup',
	function(req,res){
		res.render('pages/signup');
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
});

//Gets all the data from a members shopping cart
app.get('/cart', function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err){
			console.error('Could not connect to database');
			console.error(err);
			return;
		}
		var memberid = req.body.memberid;
		var query =  client.query("SELECT * FROM ShoppingCart WHERE memberID = '"+ memberid +"';", function(error, result){
			if(error){
				console.error(error);
				return;
			}
			done();
		});
		var results = [];
		// Stream results back one row at a time
		query.on('row', function(row){
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', function(){
			client.end();
			res.json(results);
		});
	});
});

//Gets all the items for the store
app.get('/store', function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err){
			console.error('Could not connect to database');
			console.error(err);
			return;
		}
		var memberid = req.body.memberid;
		var query =  client.query("SELECT * FROM Items;", function(error, result){
			if(error){
				console.error(error);
				return;
			}
			done();
		});
		var results = [];
		// Stream results back one row at a time
		query.on('row', function(row){
			results.push(row);
		});
		// After all data is returned, close connection and return results
		query.on('end', function(){
			client.end();
			res.json(results);
		});
	});
});

/* Currently inputs data into members table in db and then returns to /login page. */
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
			const hash = crypto.createHash('sha256');
			hash.update(password);
			var encrypted = hash.digest('hex');
			var query = client.query("insert into members values (default,'" + username + 
				"','" + encrypted + "','" + email + "');", function(error, result){
					done();
					if(error){}
						res.redirect('/login');
				});
		 });
}); 


/* Currently prints to console result of login attempt and returns to /login page. */
/* The result of the login attempt will have to be coordinated with passport... */
/* Yet to be done. */
app.post('/login', urlencodedparser, function(req,res){
		console.log('/login called');

		var email = req.body.email;
		var password = req.body.password;

		console.log('email: ' + email);
		console.log('password: ' + password);
		
		pg.connect(connectionString, function (err, client, done){
			if(err){
					console.log('Could not connect to postgresql on signup',err);
					return;
			}

			client.query("select password from members where email = '" + email + "';", function(error, result){
				done();
			if(error){
				console.log('error', error);
			}

			if(result.rows[0] != undefined){ // check for the case where no match is found in the table.
				console.log(result.rows[0].password);

				const hash1 = crypto.createHash('sha256');
				hash1.update(password);
				var passwordHash = hash1.digest('hex');

				if(passwordHash == result.rows[0].password){
					console.log('successful login 1');
					res.redirect('/login');
				} else {
					console.log('unsuccessful login');
					res.redirect('/login');
				}
			}
			else {	// No match in the table
				console.log('  email not found in database');
				res.redirect('/login');
			}

			client.end();

			});	
		});	
});


//https://scotch.io/tutorials/easy-node-authentication-setup-and-local
app.post('/Locallogin', passport.authenticate('local-login', {

        successRedirect : '/index', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
	})
	
);




app.listen(port, function() {
	console.log('Node app is running on port: '+port);
});