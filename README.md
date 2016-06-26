# NWEN304 Group 6 Online shopping project

HOW TO USE THE SYSTEM

Our deployed shopping app can be found at:

https://nwen304group6.herokuapp.com/

Two login methods are possible. A user can either login with their Facebook credentials, or if they've previously been through the signup procedure, they can login with the credentials they provided at signup time.

Once the user has signed in they are directed to the index.ejs page. From here they can either proceed to the shopping functionality, or logout.

If they move to the shopping page, items can be selected from the interactive catalogue and then added to their shopping cart. Items in the cart can be deleted if required. 
Once the checkout button has been selected, everything is removed from the shopping cart and the user can start again.

The signup procedure is self explanatory.

Passwords are sent to the server protected by SSL. Once they're at the server they are immediately hashed with SHA256 function, and the hash is stored in the 'members' table.

REST INTERFACE
 
All user status is stored in our database tables on the server side, rather than held locally on the client side. We use four tables called to save the user status. We use HTTP methods GET and POST to implement the RESTful server.

ERROR HANDLING

There is error checking for database connection. We make use of the Heroku console.log function to print out error messages, and to keep track of which function has been called.



