let fs = require('fs');

let bbox = require('geojson-bbox'); // calculate bounding box from geojson feature
let area = require('geojson-area'); // calculate area from geojson feature (for statistic density)
let rbush = require('rbush'); // calculate the intersecting objects to a grid space
let turf = require('@turf/turf'); // calculate the intersection between two geojson features
let _ = require('lodash');

// load data of Englewood community area and census blocks
let tree = rbush(),
  populations = {
    "type":"FeatureCollection",
    "features":[]
  },
  englewoodBorders,
  blockBoundaries,
  censusData;

const ARC_SECOND_GRID_SIZE = 2.5; // 5 arc-second seems to be the right level
const GRID_SIZE = ARC_SECOND_GRID_SIZE / 3600; // arc-second to decimal

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

blockBoundaries = JSON.parse(fs.readFileSync('EnglewoodCensusBlockBoundaries.geojson').toString());
censusData = JSON.parse(fs.readFileSync('EnglewoodCensusDataFull.json').toString());

let propertyNames = {};
let dataExample = censusData[Object.keys(censusData)[0]];

_.forEach(Object.keys(dataExample.data), (key) => {
  propertyNames[key] = Object.keys(dataExample.data[key]);
});

let treeItems = blockBoundaries.features.map((block) => {
  // first get bounding boxes of the census blocks
  let extents = bbox(block);

  return {
    minX: extents[0],
    minY: extents[1],
    maxX: extents[2],
    maxY: extents[3],
    data: {
      id: block.properties.geoid10,
      area: area.geometry(block.geometry),
      feature: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              block.geometry.coordinates[0][0]
            ]
          ]
        },
      }
    }
  };
});

// insert these into the rbush tree
tree.load(treeItems);

// for each grid location calculate the intersecting census block b-boxes

for (let lat = extent.lat.min; lat < extent.lat.max + GRID_SIZE; lat += GRID_SIZE) {
  for (let lng = extent.lng.min; lng < extent.lng.max + GRID_SIZE; lng += GRID_SIZE) {
    let treeSearchItem = {
      minX: lng,
      minY: lat,
      maxX: lng + GRID_SIZE,
      maxY: lat + GRID_SIZE,
    };

    let feature = convertGridSquareToPolygonFeature(lat, lng);
    let poly1 = turf.polygon(feature.geometry.coordinates);
    // feature.properties.population = 0;

    initializeFeatureProperties(feature.properties);


    let intersectedBlocks = tree.search(treeSearchItem);

    for (let block of intersectedBlocks) {
      let poly2 = turf.polygon(block.data.feature.geometry.coordinates[0]);

      let intersectedFeature = turf.intersect(poly1, poly2);

      if (intersectedFeature) {
        let areaIntersect = area.geometry(intersectedFeature.geometry);
        // only get population right now

        // add all data
        addFeatureData(feature.properties, censusData[block.data.id].data, areaIntersect/block.data.area)

        // add population to count
        // feature.properties.population +=
        //   areaIntersect/block.data.area * +censusData[block.data.id].data["TOTAL_POPULATION"].Total;
      }
    }

    populations.features.push(feature);
  }

  function initializeFeatureProperties(properties) {
    for (let propertyType of Object.keys(propertyNames)) {
      properties[propertyType] = {};

      for (let propertySubtype of propertyNames[propertyType]) {
        properties[propertyType][propertySubtype] = 0;
      }
    }
  }

  function addFeatureData(properties, data, areaPercentage) {
    for (let propertyType of Object.keys(propertyNames)) {
      for (let propertySubtype of propertyNames[propertyType]) {
        properties[propertyType][propertySubtype] +=
          areaPercentage * parseInt(data[propertyType][propertySubtype]);
      }
    }
  }
}

// output population data in grid
fs.writeFileSync("allDataGrid.geojson", JSON.stringify(populations));

// take min lat and lng (the corner) and convert to a "feature"
function convertGridSquareToPolygonFeature(lat, lng) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng, lat],
          [lng + GRID_SIZE, lat],
          [lng + GRID_SIZE, lat + GRID_SIZE],
          [lng, lat + GRID_SIZE],
          [lng, lat]
        ]
      ]
    }
  };
}
