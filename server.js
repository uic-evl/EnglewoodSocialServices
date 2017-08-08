// Authentication module.
var auth = require('http-auth');
var express = require('express');

var path = require('path');
var fs = require('fs');

var basic = auth.basic({
      file: path.join(__dirname, "admin-data", "users.htpasswd") // englewood-admin | helpthesekids
    }
);

// Application setup.
var app = express();
let admin = express();

admin.use(auth.connect(basic));
// admin.use(express.static("./"))

app.use('/admin', admin);
app.use(express.static("./"));

// Setup route.
admin.get('/', (req, res) => {
    // res.send(`Hello from express - ${req.user}!`);
  res.sendFile(path.join(__dirname, 'admin.html'));
});

admin.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
});

admin.post('/csv', (req, res) => {
  console.log("Send CSV File");
  console.log(req);

});

function addToLog(req, res) {

}

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
});
