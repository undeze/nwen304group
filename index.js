var express = require('express');
var app = express();
var port = process.env.PORT;
var bodyParser = require('body-parser');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL;
var client = new pg.Client(connectionString);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/'));

// views is directory for all template files
app.set('views', __dirname + '/');
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('index');
});

app.listen(port,function(){
	console.log('Listening');
});