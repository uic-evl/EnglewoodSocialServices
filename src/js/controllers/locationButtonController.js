"use strict";

var App = App || {};

let LocationButtonController = function() {
  let self = {
    locationButton: null
  };

  init();

  function init(){}

  function attachLocationButton(id) {
    self.allServicesButton = d3.select(id)
      .on('click', updateLocationOnMap);
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
          App.views.map.jumpToUsersLocation(pos);
        });

    }
    else {
      console.log('wait shit')
    }
  }

  return {
    attachLocationButton
  };
};
