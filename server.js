// Authentication module.
var auth = require('http-auth');
var express = require('express');
var path = require('path');

var basic = auth.basic({
    }, (username, password, callback) => {
	    // Custom authentication
	    // Use callback(error) if you want to throw async error.
		callback(username === "englewood-admin" && password === "Test");
	});

// Application setup.
var app = express();
let admin = express();

admin.use(auth.connect(basic));
app.use('/admin', admin);
app.use(express.static("."));

// Setup route.
admin.get('/', (req, res) => {
    // res.send(`Hello from express - ${req.user}!`);
  res.sendFile(path.join(__dirname, 'admin.html'))
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
});
