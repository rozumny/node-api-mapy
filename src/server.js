var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var merge = require('merge');
var usersRoute = require('./routes/users');
var authenticationRoute = require('./routes/authentication');

var router = express.Router();

app.set('secret', "423vb46f24vbvbc234cvsgbb542v");
app.use(morgan('dev')); // log requests to the console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose = require('mongoose');
mongoose.connect('localhost:27017'); // connect to our database

router.get('/', (req, res) => {
	res.json({ message: 'API running!' });
});
app.use('/', router);
app.use('/api/users', usersRoute)

var port = process.env.PORT || 8080;
app.listen(port);
console.log('API running on port ' + port);
