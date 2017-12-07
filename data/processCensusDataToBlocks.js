// based on and replaces processCensusDataToGrid.js
let fs = require('fs');
let _ = require('lodash');

// load data of Englewood community area and census blocks
let blockBoundaries,censusData;

blockBoundaries = JSON.parse(fs.readFileSync('EnglewoodCensusBlockBoundaries.geojson').toString());
censusData = JSON.parse(fs.readFileSync('EnglewoodCensusDataFull.json').toString());

let propertyNames = {};
let dataExample = censusData[Object.keys(censusData)[0]];

_.forEach(Object.keys(dataExample.data), (key) => {
  propertyNames[key] = Object.keys(dataExample.data[key]);
});

// fs.writeFile("mapTypeNames.json", JSON.stringify(propertyNames));

function getFeatureDataForBlock(blockID){
    let censusObject = censusData[blockID];
    if(!censusObject){
        throw `No data at block ${blockID}`;
    }

    let featureData = {}, statistics = censusObject.data;

    for (let propertyType of Object.keys(propertyNames)) {
        featureData[propertyType] = {};
      for (let propertySubtype of propertyNames[propertyType]) {
        featureData[propertyType][propertySubtype] = parseInt(statistics[propertyType][propertySubtype]);
      }
    }

    return featureData;
}

// attach census data for every black
for(let block of blockBoundaries.features){
    block.properties.census = getFeatureDataForBlock(block.properties.geoid10);
}

// output population data in grid
fs.writeFileSync("allDataBlocks.geojson", JSON.stringify(blockBoundaries));