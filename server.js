// Authentication module.
var auth = require('http-auth');
var express = require('express');
let bodyParser = require('body-parser');

var argv = require('yargs')
  .usage('Usage: $0 -p [integer] -i [string of IP address]')
  .default("p", 4000)
  .default("i", '')
  .alias('p', 'port')
  .alias('i', 'ip').alias('i', 'ip-address')
  .describe('p', 'Port to run server on')
  .describe('i', 'IP Address to run server on')
  .help('h')
  .alias('h', 'help')
  .argv;

var path = require('path');
var fs = require('fs-extra');

var basic = auth.basic({
      file: path.join(__dirname, "admin-data", "users.htpasswd") // englewood-admin | helpthesekids
    }
);

// Application setup.
var app = express();
let admin = express();

admin.use(bodyParser.json());
admin.use(auth.connect(basic));

app.use('/admin', admin);
app.use(express.static("./"));

if(argv.ip.length > 0){
  app.listen(argv.port,argv.ip, function () {
    // console.log('Example app listening on port 4000!')
    console.log("Listening on " + this.address().address + ":" + this.address().port);
  });
}else{
  app.listen(argv.port, function () {
    // console.log('Example app listening on port 4000!')
    console.log("Listening on " + this.address().address + ":" + this.address().port);
  });
}

admin.get('/getlog', (req, res) => {
  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
});

admin.put('/savenew', (req, res) => {
  addNewFile(req.body.data, req.body.name, res);
});

admin.put('/chooseold', (req, res) => {

  changeUsedFile(req.body.time, req.body.name, res);
});

function addNewFile(data, fileName, res) {
  let time = Date.now();
  // write as new file to use
  fs.writeFileSync(path.join(__dirname, "admin-data", "EnglewoodLocations.csv"), data);

  // write archiving version, also
  fs.writeFileSync(path.join(__dirname, "admin-data", "archive-data", (time + fileName)), data);

  // parse CSV
  let log = (fs.readFileSync(path.join(__dirname, "admin-data", "LOG.csv")).toString()).split("\n").map(entry => entry.split(","));
  // set existing entries to false
  log.forEach((entry) => { entry[2] = false });
  // join log entries together
  let clearedLog = log.map((entry) => entry.join(","));
  // add new entry
  clearedLog.push(`${time},${fileName},true`);
  
  // join back into csv string
  let logString = clearedLog.join("\n");
  console.log(logString);

  // write updated log
  fs.writeFileSync(path.join(__dirname, "admin-data", "LOG.csv"), logString);

  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
}

function changeUsedFile(timestamp, fileName, res) {
  let time = new Date(+timestamp).getTime();

  // parse CSV
  let log = (fs.readFileSync(path.join(__dirname, "admin-data", "LOG.csv")).toString()).split("\n").map(entry => entry.split(","));
  // set existing entries to false
  console.log("Choose", time, fileName);
  log.forEach((entry) => { entry[2] = (entry[0] == timestamp && entry[1] == fileName); });

  fs.copySync(path.join(__dirname, "admin-data", "archive-data", (timestamp + fileName)), path.join(__dirname, "admin-data", "EnglewoodLocations.csv"));

  fs.writeFileSync(path.join(__dirname, "admin-data", "LOG.csv"), log.map(entry => entry.join(',')).join("\n"));
  res.sendFile(path.join(__dirname, "admin-data", "LOG.csv"));
}
