// Authentication module.
var auth = require('http-auth');
var express = require('express');
let bodyParser = require('body-parser');

var path = require('path');
var fs = require('fs');

var basic = auth.basic({
      file: path.join(__dirname, "admin-data", "users.htpasswd") // englewood-admin | helpthesekids
    }
);

// Application setup.
var app = express();
let admin = express();

admin.use(bodyParser.json());
// admin.use(bodyParser.text({type: "text/csv"}));
admin.use(auth.connect(basic));
// admin.use(express.static("./"))

app.use('/admin', admin);
app.use(express.static("./"));

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
});

// Setup route.
admin.get('/', (req, res) => {
    // res.send(`Hello from express - ${req.user}!`);
  res.sendFile(path.join(__dirname, 'admin.html'));
});

admin.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
});

admin.put('/csv', (req, res) => {
  fs.writeFileSync(path.join(__dirname, "admin-data", "TestWrite.csv"), req.body.data);

  addToLog(req.body.name, res);
});

function addToLog(fileName, res) {
  let time = new Date().toString();
  fs.appendFileSync(path.join(__dirname, "admin-data", "LOG.csv"), `${time},${fileName}\n`);

  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
}
