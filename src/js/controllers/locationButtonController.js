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

    console.log('adding event handler to ', id);
  }

  function updateLocationOnMap() {
    // make this and call App.views.map.setLocation()
    // using data from https://www.w3schools.com/html/html5_geolocation.asp
    if (navigator.geolocation) {
      console.log('found something!')
      navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          console.log("Latitude: " + pos.lat + "   Longitude: " + pos.lng);
          App.views.map.jumpToLocation(pos);
        });

    }
    else {
      console.log('wait shit')
    }
  }

  function getLatLngFromAddress(address) {
    // Google Maps Geocoding API:
    //    https://developers.google.com/maps/documentation/geocoding/start#get-a-key
    // API Key: AIzaSyAUDFjBPoiSQprcBvEhc9w6SJeR3EK4IGI
  }

  return {
    attachLocationButton,
    attachAddressLookupButton
  };
};
