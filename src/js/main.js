// initialize App global variable, we will attach other globals to our App variable
var App = App || {};

// IIFE statement invoked on load of script (importantly keeps variables inside in a local scope)
(function() {

  // global init function to be called when the html body loads
  App.init = function() {
    // initialize map
    App.map = L.map('map').setView([41.779786, -87.644778], 15);

    // create the map layer using data from openstreetmap
    var osmUrl= 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // var osmUrl = 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

  	var osm = new L.TileLayer(osmUrl, {minZoom: 11, maxZoom: 18, attribution: osmAttrib});

    App.map.addLayer(osm);

    d3.queue()
      .defer(d3.json, "./data/ChicagoCensusBlockBoundaries.geojson")
      .defer(d3.json, "./data/ChicagoCensusTractBoundaries.geojson")
      .defer(d3.csv, "./data/ChicagoCensusPopulations.csv")
      .defer(d3.json, "./data/CommunityAreaBoundaries.geojson")
      // .defer(d3.json, "./data/EnglewoodColumnHeaders.geojson")
      .defer(d3.csv, "./data/EnglewoodLocations.csv")
      .await(dataLoaded)
  };

  function dataLoaded(err, blockBoundaries, tractBoundaries, censusPopulations, communityAreas, englewoodLocations) {
    if (err) throw Error(err);

    // store data that will need to be accessed again
    App.data = {};

    // convert populations from an array to a lookup table by census block
    App.data.populations = {};

    for (let block of censusPopulations) {
      App.data.populations[block["CENSUS BLOCK"]] = block["TOTAL POPULATION"];
    }

    // create a lookup to convert a census tract to a community area
    App.data.tractInfo = {};

    for (let tract of tractBoundaries.features) {
      App.data.tractInfo[tract.properties.tractce10] = tract.properties;
    }


    // get the maximum population in any census block
    let maxPop = d3.max(censusPopulations, d => d["TOTAL POPULATION"]);

    // create a d3 color scale to convert a population number to a color value
    let colorScale = d3.scaleLinear()
      .domain(d3.range(0, 7).map(n => n/6 * maxPop)) // need an array of 6 values to map to the 6 colors
      .range(['#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'])
      .clamp(true);

    // filter out census blocks based on the community to focus on englewood
    blockBoundaries.features = blockBoundaries.features.filter(b => {
      let tract = App.data.tractInfo[b.properties.tractce10];

      if (tract) {
        let comm = parseInt(tract.commarea);

        return comm === 67 || comm === 68;
      }

      return false;
    });

    // filter out community areas to only draw a border on englewood
    communityAreas.features = communityAreas.features.filter(b => {

      let comm = parseInt(b.properties.area_num_1);

      // console.log(comm);
      return comm === 67 || comm === 68;

      return true;
    });

    // create map elements from the community areas geojson file
    // (only use as borders for the community areas)
    L.geoJSON(communityAreas, {
        style: function (feature) {
            return {
              color: "#00ac9d",
              fill: false
            };
        }
    }).addTo(App.map);

    // create map elements from the census block boundaries
    // in the style property, color by the color scale based on the census block#
    L.geoJSON(blockBoundaries, {
        style: function (feature) {
            return {
              color: colorScale(App.data.populations[feature.properties.tract_bloc]),
              fillOpacity: 0.5,
              stroke: false
            };
        }
    }).addTo(App.map);


    // iterate through the social services location file
    for (let loc of englewoodLocations) {
      // convert the X and Y values to lat and lng for clarity
      let lat = loc.Y,
        lng = loc.X;

      // create a marker for each social services location
      L.marker(
        L.latLng(lat,lng),
        {
          riseOnHover: true // moves the marker to the front on mouseover
        }
      ).bindPopup(function(layer) { // allow for the popup on click with the name of the location
        return "<strong>" + loc["Organization Name"] + "</strong><br>"
         + loc["Description of Services Provided in Englewood"];
      }).addTo(App.map);
    }

  }
})();
