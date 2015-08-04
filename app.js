var http = require('http');
var express = require('express');
var mysql = require('mysql');
var ConnectInfo = require('./ConnectInfo');

var connection = mysql.createConnection({
	host: ConnectInfo.hostname,
	database: ConnectInfo.database,
	user: ConnectInfo.user,
	password: ConnectInfo.password
});

connection.connect();

var app = express();
app.set('port', process.env.PORT || 3000);

var rootRouter = express.Router();
var programRouter = express.Router({ mergeParams: true });

rootRouter.use('/programs/:prog_id', programRouter);	// Allows for nested routing with program id

rootRouter.route('/programs')
	.get(function (req, res) {
		res.type('json');
		var queryStr = 'SELECT * FROM program';
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			res.send(rows);
		});
	});

rootRouter.route('/programs/:prog_id')
	.get(function (req, res) {
		var queryStr = 'SELECT * FROM program WHERE id=' + req.params.prog_id;
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			res.send(rows);
		});
	});

programRouter.route('/guests')
	.get(function (req, res) {
		res.type('json');
		var queryStr = 'SELECT * FROM guest WHERE program_id=' + req.params.prog_id;
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			res.send(rows);
		});
	});

programRouter.route('/agenda')
	.get(function (req, res) {
		res.type('json');
		var queryStr = 'SELECT * FROM agenda_item WHERE program_id=' + req.params.prog_id;
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			var formatAgenda = Array();
			var dayIdx = 1;
			var day = Array();

			for (var i = 0; i < rows.length; i++) {
				if (rows[i].day == dayIdx) {			// If the agenda item is for the same day as the dayIdx
					day.push(rows[i])					// Add the agenda item to that day
				} else {								// Otherwise if the agenda item is for a different day
					formatAgenda.push(day);				// The day is complete and we push it onto the agenda
					day = Array();						// We clear the day
					day.push(rows[i]);					// We push the agenda item onto the new day
					dayIdx++							// We increment the dayIdx for the next day
				}
			}

			formatAgenda.push(day);						// Push final day onto array
			res.send(formatAgenda);						// Send 2D array of agenda items
		});
	});

programRouter.route('/prizes')
	.get(function (req, res) {
		res.type('json');
		var queryStr = 'SELECT * FROM prize WHERE program_id=' + req.params.prog_id;
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			res.send(rows);
		});
	});

programRouter.route('/sponsors')
	.get(function (req, res) {
		res.type('json');
		var queryStr = 'SELECT * FROM sponsor WHERE program_id=' + req.params.prog_id;
		connection.query(queryStr, function (err, rows, fields) {
			if (err)
				throw err;

			res.send(rows);
		});
	});

app.use('/sp-api', rootRouter);

app.use( function (req, res) {
	res.type('text/plain');
	res.status(400);
	res.send('404 - Not Found, Loser.');
});

app.use( function (req, res) {
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error, Dummy.');
});


app.listen( app.get('port'), function () {
	console.log('Express started on localhost:' + app.get('port') + '; press CTRL + C to terminate');
});