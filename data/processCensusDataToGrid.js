let fs = require('fs');

let bbox = require('geojson-bbox'); // calculate bounding box from geojson feature
let area = require('geojson-area'); // calculate area from geojson feature (for statistic density)
let rbush = require('rbush'); // calculate the intersecting objects to a grid space
let intersect = require('turf-intersect'); // calculate the intersection between two geojson features

// load data of Englewood community area and census blocks
let blockLookup = rbush(),
  englewoodBorders,
  blockBoundaries,
  censusData;

// extents of englewood neighborhoods (west & regular)
// [ -87.6796718667824, ***
//   41.757630738509604,
//   -87.65393085118126,
//   41.79417427027236 ]
// [ -87.65487424668116,
//   41.75607720666332, ***
//   -87.62824698158252, ***
//   41.794599284530136 ] ***

// lat ~ y
// lng ~ x

const ARC_SECOND_GRID_SIZE = 2;
const GRID_SIZE = ARC_SECOND_GRID_SIZE / 3600; // arc-second to decimal

let extent = {
  lat: {
    min: 41.75607720666332,
    max: 41.794599284530136
  },
  lng: {
    min: -87.6796718667824,
    max: -87.62824698158252
  }
}

console.log((extent.lat.max - extent.lat.min) / GRID_SIZE);
console.log((extent.lng.max - extent.lng.min) / GRID_SIZE);

blockBoundaries = JSON.parse(fs.readFileSync('EnglewoodCensusBlockBoundaries.geojson').toString());
censusData = JSON.parse(fs.readFileSync('EnglewoodCensusDataFull.json').toString());

console.log(blockBoundaries.features[0]);

let treeItems = blockBoundaries.features.map((block) => {
  let extents = bbox(block);

  return {
    minX: extents[0],
    minY: extents[1],
    maxX: extents[2],
    maxY: extents[3],
    data: {
      id: block.properties.geoid10,
      area: area.geometry(block.geometry)
    }
  };
});

// console.log(censusData[treeItems[0].data.id]);

// first get bounding boxes of the census blocks

// insert these into the rbush tree

// get bounding box of englewood neighborhood

// split this into a grid (maybe 7.5 arc-seconds) in lat-lng coordinates

// for each grid location calculate the intersecting census block b-boxes

// calculate the intersection between the grid and the actual census block area

// compute a weighted average for that grid space based on the intersecting areas

// export this data :)
