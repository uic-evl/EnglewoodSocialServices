// initialize App global variable, we will attach other globals to our App variable
var App = App || {};

// IIFE statement invoked on load of script
(function() {

  // global init function to be called when the html body loads
  App.init = function() {
    // initialize map
    App.map = L.map('map').setView([41.779786, -87.644778], 15);

    // create the map layer using data from openstreetmap
    // var osmUrl='http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
    var osmUrl = 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

  	var osm = new L.TileLayer(osmUrl, {minZoom: 11, maxZoom: 18, attribution: osmAttrib});

    App.map.addLayer(osm);

    d3.queue()
      .defer(d3.json, "./data/ChicagoCensusBlockBoundaries.geojson")
      .defer(d3.csv, "./data/ChicagoCensusPopulations.csv")
      .defer(d3.json, "./data/CommunityAreaBoundaries.geojson")
      // .defer(d3.json, "./data/EnglewoodColumnHeaders.geojson")
      .defer(d3.csv, "./data/EnglewoodLocations.csv")
      .await(dataLoaded)
  };

  function dataLoaded(err, censusBoundaries, censusPopulations, communityAreas, englewoodLocations) {
    if (err) throw Error(err);

    App.data = {};
    App.data.populations = {};

    for (let block of censusPopulations) {
      App.data.populations[block["CENSUS BLOCK"]] = block["TOTAL POPULATION"];
    }

    let maxPop = d3.max(censusPopulations, d => d["TOTAL POPULATION"]);
    let colorScale = d3.scaleLinear()
      .domain(d3.range(0, 7).map(n => n/6 * maxPop))
      .range(['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a'])
      .clamp(true);

    console.log(colorScale.domain(), colorScale.range());

    censusBoundaries.features = censusBoundaries.features.filter(b => {
      let comm = Math.floor(parseInt(b.properties.tractce10) / 10000);

      return comm === 67 || comm === 68;
    });

    communityAreas.features = communityAreas.features.filter(b => {

      let comm = parseInt(b.properties.area_num_1);

      // console.log(comm);
      return comm === 67 || comm === 68;

      return true;
    });

    L.geoJSON(communityAreas, {
        style: function (feature) {
            return {
              color: "#00ac9d",
              fill: false
            };
        }
    }).addTo(App.map);

    L.geoJSON(censusBoundaries, {
        style: function (feature) {
            return {
              color: colorScale(App.data.populations[feature.properties.tract_bloc])
            };
        }
    }).addTo(App.map);

    for (let loc of englewoodLocations) {
      let lat = loc.Y,
        lng = loc.X;

      L.marker(
        L.latLng(lat,lng),
        {
          riseOnHover: true
        }
      ).bindPopup(function(layer) {
        return loc["Organization Name"];
      }).addTo(App.map);
    }

  }
})();
