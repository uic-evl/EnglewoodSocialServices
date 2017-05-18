let fs = require('fs');
let d3 = require('d3');

// our data to write out after processing
let eachFileData = {};
let compactData = {};

let fileKey = readDSVFile("./NewCensusData/CensusFileKey.csv", ",");
let fileKeyDict = {};

// create key dictionary
for (let key of fileKey) {
  fileKeyDict[key.code] = key.descriptor;
}

// Tract Full: "17031010100"
// Tract ID: 17031 - "010100"
// Block Full: Tract Full + BlockID

let tracts = readJSONFile("./EnglewoodCensusTractBoundaries.geojson");

// create a lookup to convert a census tract to a community area
// (These are filtered to only contain tracts in englewood)
tractInfo = {};

for (let tract of tracts.features) {
  tractInfo[tract.properties.geoid10] = tract.properties;
}

let fileDir = "./NewCensusData/"
let censusFileStart = "DEC_10_SF1_";
let censusFileEnd = "_with_ann.tsv";
// read census files

for (let code of Object.keys(fileKeyDict)) {
  let fileName = censusFileStart + code + censusFileEnd;
  let filePath = fileDir + fileName;
  console.log("Processing:", fileName);

  let currentFileData = eachFileData[fileKeyDict[code]] = {};

  try {
    let fileData = readDSVFile(filePath, "\t", 1);

    let filteredData = fileData.filter(function(d) {
      if (d.Id2) {
        let tract = getFullTractFromBlockID(d["Id2"]);

        if (tractInfo[tract]) {
          let comm = parseInt(tractInfo[tract].commarea_n);

          return comm === 67 || comm === 68;
        }

        return false;
      }
      return false;
    });

    for (let entry of filteredData) {
      if (entry.Id2) {
        currentFileData[entry.Id2] = entry;
      }
    }
  }
  catch (err) {
    console.log("Error reading File");
  }
}

for (let code of Object.keys(eachFileData)) {
  let fileData = eachFileData[code];

  for (let block of Object.keys(fileData)) {
    if (!compactData[block]) {
      compactData[block] = {
        Id: fileData[block].Id,
        Id2: fileData[block].Id2,
        Geography: fileData[block].Geography,
        data: {}
      };
    }

    let properties = Object.keys(fileData[block]).filter(d => {
      return d !== "Id" && d !== "Id2" && d !== "Geography";
    });

    compactData[block].data[code] = {};

    for (let prop of properties) {
      compactData[block].data[code][prop] = fileData[block][prop];
    }
  }
}

fs.writeFileSync("EnglewoodCensusDataFull.json", JSON.stringify(compactData));

/* Util Functions */

function readDSVFile(path, delimiter, headerLine) {
  headerLine = headerLine ? headerLine : 0;

  let fileString = fs.readFileSync(path).toString();

  // convert string to array of arrays (CSV)
  let duoArray = fileString.split("\n").map(d => d.split(delimiter));

  let headers = duoArray[headerLine];
  let items = duoArray.slice(headerLine+1, duoArray.length);
  // items = items.filter(d => d.length === headers.length);

  let arrOfObj = [];

  for (let item of items) {
    let obj = {};

    for (let keyIndex in headers) {
      obj[headers[keyIndex]] = item[keyIndex];
    }

    arrOfObj.push(obj);
  }

  return arrOfObj;
}

function readJSONFile(path) {
  let fileString = fs.readFileSync(path).toString();

  return JSON.parse(fileString);
}

function getFullTractFromBlockID(bID) {
  return bID.substring(0, 11);
}

function getTractFromBlockID(bID) {
  return bID.substring(5, 11);
}

function getTractBlockFromBlockID(bID) {
  return bID.substring(5);
}
