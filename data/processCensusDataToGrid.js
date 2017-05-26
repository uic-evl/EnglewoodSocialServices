let bbox = require('geojson-bbox'); // calculate bounding box from geojson feature
let rbush = require('rbush'); // calculate the intersecting objects to a grid space

// first get bounding boxes of the census blocks

// insert these into the rbush tree

// get bounding box of englewood neighborhood

// split this into a grid (maybe 7.5 arc-seconds) in lat-lng coordinates

// for each grid location calculate the intersecting census block b-boxes

// calculate the intersection between the grid and the actual census block area

// compute a weighted average for that grid space based on the intersecting areas

// export this data :)
