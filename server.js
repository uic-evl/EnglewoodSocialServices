// Authentication module.
var auth = require('http-auth');
var express = require('express');
var path = require('path');

var basic = auth.basic({
      file: path.join(__dirname, "admin-data", "users.htpasswd") // englewood-admin | helpthesekids
    }
);

// Application setup.
var app = express();
let admin = express();

admin.use(auth.connect(basic));
app.use('/admin', admin);
app.use(express.static("./"));

// Setup route.
admin.get('/', (req, res) => {
    // res.send(`Hello from express - ${req.user}!`);
  res.sendFile(path.join(__dirname, 'admin.html'));
});

admin.post('/', (req, res) => {
  console.log("New File");
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
});
