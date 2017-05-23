"use strict";

var App = App || {};

let MapView = function(div) {
  let self = {
    map: null
  };

  init();

  function init() {
    self.map = L.map(div);
    // create the map layer using data from openstreetmap

    // var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // normal
    var osmUrl = 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'; // dark
    // var osmUrl = 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'; // light

    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    var osm = new L.TileLayer(osmUrl, {minZoom: 11, maxZoom: 18, attribution: osmAttrib});

    self.map.addLayer(osm);
    self.map.setView([41.779786, -87.644778], 15, {
      // reset: true
    });



    // causes map to recalculate size... (I shouldn't need to do this)
    setTimeout(function() {
      self.map.invalidateSize();
    }, 0);
  }

  function getMap() {
    return self.map;
  }

  return {
    getMap
  };
};
