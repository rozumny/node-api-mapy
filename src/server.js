var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var cors = require('cors');
var merge = require('merge');
var usersRoute = require('./routes/users');
var filesRoute = require('./routes/files');
var authenticationRoute = require('./routes/authentication');
var path = require('path');

var router = express.Router();

app.set('secret', "423vb46f24vbvbc234cvsgbb542v");
app.use(morgan('dev')); // log requests to the console
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose = require('mongoose');
mongoose.connect('localhost:27017'); // connect to our database
// mongoose.connect('mongodb://kofola:mbKjdQ1feszJ@127.0.0.1:27017/rm2kofola');

router.get('/', (req, res) => {
	res.json({ message: 'API running!' });
});
app.use('/', router);
app.use('/api/users', usersRoute)
app.use('/api/files', filesRoute)

var port = process.env.PORT || 8082;
app.listen(port);
console.log('API running on port ' + port);
