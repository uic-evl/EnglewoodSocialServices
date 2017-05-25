"use strict";

var App = App || {};

let LocationButtonController = function() {
  let self = {
    locationButton: null,
    addressLookupButton: null
  };

  init();

  function init(){}

  function attachLocationButton(id) {
    self.locationButton = d3.select(id)
    .on('click', updateLocationOnMap);
    console.log('adding event handler to ', id);

  }

  function attachAddressLookupButton(id) {
    self.addressLookupButton = d3.select(id)
    .on('click', getLatLngFromAddress)
    console.log('adding event handler to ', id);
  }

  function updateLocationOnMap() {
    // make this and call App.views.map.setLocation()
    // using data from https://www.w3schools.com/html/html5_geolocation.asp
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        App.views.map.jumpToLocation(pos);
      });

    }
  }

  function getLatLngFromAddress() {
    // Google Maps Geocoding API:
    //    https://developers.google.com/maps/documentation/geocoding/start#get-a-key
    // API Key: AIzaSyAUDFjBPoiSQprcBvEhc9w6SJeR3EK4IGI

    console.log(d3.select('#addressInput').node().value);  

    var address = d3.select('#addressInput').node().value;

    var replaced = address.split(' ').join('+');
    console.log(replaced);

    var object = d3.json("https://maps.googleapis.com/maps/api/geocode/json?address="+replaced+"&key=AIzaSyAUDFjBPoiSQprcBvEhc9w6SJeR3EK4IGI", function(err,d){
    console.log(d.results[0].geometry.location);
    App.views.map.jumpToLocation(d.results[0].geometry.location);
    })

  }

return {
  attachLocationButton,
  attachAddressLookupButton
};
};
