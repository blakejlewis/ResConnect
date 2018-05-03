var mysql = require('mysql');
var connection = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: 'trixie1',
	database: 'resconnect'
});

connection.connect(function(err) {
	if (err) throw err;

	else{
		console.log("Connection successful!");
	}
});

module.exports = connection;