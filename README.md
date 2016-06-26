# NWEN304 Group 6 Online shopping project

Our deployed shopping app can be found at:

https://nwen304group6.herokuapp.com/

Two login methods are possible. A user can either login with their Facebook credentials, or if they've previously been through the signup procedure, they can login with the credentials they provided at signup time.

Once the user has signed in they are directed to the index.ejs page. From here they can either proceed to the shopping functionality, or logout.

If they move to the shopping page, items can be selected from the interactive catalogue and then added to their shopping cart. Items in the cart can be deleted if required. 
Once the checkout button has been selected, everything is removed from the shopping cart and the user can start again.

The signup procedure is self explanatory.

Passwords are sent to the server protected by SSL. Once they're at the server they are immediately hashed with SHA256 function, and the hash is stored in the 'members' table.

