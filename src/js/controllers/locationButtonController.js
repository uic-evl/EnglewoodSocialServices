"use strict";

var App = App || {};

let LocationButtonController = function() {
  let self = {
    locationButton: null
  };

  function attachLocationButton(id) {
    console.log('adding event handler to ', id);
  }

  function updateLocationOnMap() {
    // make this and call App.views.map.setLocation()
    // using data from https://www.w3schools.com/html/html5_geolocation.asp
  }

  return {
    attachLocationButton
  };
};
