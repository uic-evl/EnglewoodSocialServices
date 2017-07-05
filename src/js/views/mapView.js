"use strict";

var App = App || {};

let MapView = function(div) {
  let self = {
    map: null,
    serviceLayer: null,
    currentLocationMarker: null,
    icons: {},

    iconColorNames: ["blue", "red", "green", "orange", "yellow", "violet", "grey", "black"],
    iconColors: {
      "blue": "#2e84cb",
      "red": "#cb2d40",
      "green": "#28ad25",
      "orange": "#cc852a",
      "yellow": "#cac428",
      "violet": "#9c2bcb",
      "grey": "#7b7b7b",
      "black": "#3e3e3e"
    },

    circles: {},
    totalCircles: 0
  };

  init();

  function init() {
    initIcons(); // create icon references for map use
    createMap();
  }

  function createMap() {
    console.log(d3.select("#" + div).node().clientWidth);

    self.map = L.map(div);
    console.log(self.map.getSize());
    // create the map layer using data from openstreetmap

    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // normal
    // var osmUrl = 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'; // dark
    // var osmUrl = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'; // light

    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    var osm = new L.TileLayer(osmUrl, {
      minZoom: 11,
      maxZoom: 18,
      attribution: osmAttrib
    });

    self.map.addLayer(osm);
    self.map.setView([41.779786, -87.644778], 15);

    self.serviceGroup = L.layerGroup([]).addTo(self.map);
    self.map.zoomControl.setPosition('topright');

    // causes map to recalculate size... (I shouldn't need to do this)
    // setTimeout(function() {
    //   self.map.invalidateSize();
    // }, 0);
  }

  // initialize the different icon options by color
  function initIcons() {
    for (let color of self.iconColorNames) {
      self.icons[color] = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-' + color + '.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }
  }

  function plotServices(englewoodLocations) {
    self.serviceGroup.clearLayers();

    // iterate through the social services location file
    for (let loc of englewoodLocations) {
      // convert the X and Y values to lat and lng for clarity
      let lat = loc.Y,
        lng = loc.X;

      // create a marker for each social services location
      L.marker(
        L.latLng(lat, lng), {
          icon: self.icons[self.iconColorNames[0]],
          riseOnHover: true, // moves the marker to the front on mouseover
          // bind data to marker inside options
          data: loc
        }
      ).bindPopup(function(layer) { // allow for the popup on click with the name of the location
        return "<strong>" + loc["Organization Name"] + "</strong><br>" +
          loc["Description of Services Provided in Englewood"] + "<br><br>" +
          "<strong><a href='http://maps.google.com/?q=" + loc["Address"] + "'target='_blank'>" +
          "<span class='glyphicon glyphicon-share-alt'></span> Google Maps</a></strong>";
      }).addTo(self.serviceGroup);
    }
  }

  function updateServicesWithFilter(serviceFilters) {
    if (Object.keys(serviceFilters).length === 0) {
      // if there are no filters, show all locations
      self.serviceGroup.eachLayer(function(layer) {
        layer.setOpacity(1);
      });
    } else {
      // otherwise only show locations that match at least one of the selected properties
      self.serviceGroup.eachLayer(function(layer) {
        let loc = layer.options.data;
        let show = false;

        for (let property of Object.keys(serviceFilters)) {
          if (loc[property] == 1) {
            show = true;
            break;
          }
        }

        if (show) {
          layer.setOpacity(1);
        } else {
          layer.setOpacity(0.2);
          // layer.setOpacity(0);
        }

      });
    }
  }

  function setSelectedService(service) {
    self.serviceGroup.eachLayer(function(layer) {
      if (service && service["Organization Name"] === layer.options.data["Organization Name"]) {
        layer.setIcon(self.icons["orange"]);
      } else {
        layer.setIcon(self.icons["blue"]);
      }
    });

    if (service) {
      self.map.setView([service.Y, service.X], 16);
    }
  }

  function drawLocationMarker(position){
    self.currentLocationMarker = L.marker(position, {
      icon: self.icons[self.iconColorNames[1]],
      zIndexOffset: 200
    });

    self.map.addLayer(self.currentLocationMarker);
  }

  function drawCircle(center, radialPoint) {
    let llCenter = self.map.containerPointToLatLng(center);
    let llRadial = self.map.containerPointToLatLng(radialPoint);

    let radius = llCenter.distanceTo(llRadial);

    let circle = L.circle(llCenter, {
      radius,
      color: d3.schemeCategory10[self.totalCircles],
      data: self.totalCircles
    })
    .bindPopup(function(layer) { // allow for the popup on click with the name of the location
      return `<button class='btn btn-xs btn-danger' onclick='App.views.map.removeCircle(${layer.options.data})'>
      <span class='glyphicon glyphicon-remove'></span> Remove</button>`;
    })
    .addTo(self.map);

    self.circles[self.totalCircles++] = circle;

    return {center: llCenter, radius};
  }

  function removeCircle(circle) {
    console.log("removing", circle);
    self.map.removeLayer(self.circles[circle]);
  }

  function jumpToLocation(position) {
    //remove previous circle marker
    if(self.currentLocationMarker != undefined)
      self.map.removeLayer(self.currentLocationMarker);

    //move map to new poisition
    self.map.setView([position.lat, position.lng], 16);

    //draw a circle marker at new position
    drawLocationMarker(position);
  }

  return {
    createMap,
    plotServices,
    updateServicesWithFilter,
    setSelectedService,

    drawCircle,
    removeCircle,

    jumpToLocation
  };
};
