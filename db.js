exports.loginPost = loginPost



/* Login without facebook */
function loginPost(req, res, next) {
	console.log('index.js loginPost');
  	// Ask passport to authenticate.
  	/* Local authentication. That is, authentication without Facebook */
  	passport.authenticate('local', function(err, username, info) {
  		console.log('loginPost passport.auth');
    	if (err) {
      	// if error happens
      	console.log('loginPost err');
      	return next(err);
    	}    
    	if (!username) {
      	// If authentication fails, get the error message that we set
      	// from previous (info.message) step, assign it into to
      	// req.session and redirect to the login page again to display
      	req.session.messages = info.message;
      	console.log('loginPost !username');
      	return res.redirect('/login');
    }
    // If everything's OK
    req.logIn(username, function(err) {
      	if (err) {
        	req.session.messages = "Error";
        	console.log('loginPost Error');
        	return next(err);
      	}
      	// Set the message
      	req.session.messages = "Login successfully";

      	/* Set the displayName */
      	var nu = { displayName : username };
      	req.session.passport.user = nu;

      	console.log('loginPost successful');
      	return res.redirect('/index');
    });    
  })(req, res, next);
}
