"use strict";

var App = App || {};

let ServiceListView = function(listID) {
  let self = {
    serviceList: null
  };

  init();

  function init() {
    self.serviceList = d3.select(listID);
  }

  function populateList(englewoodLocations) {
    console.log(englewoodLocations);

  }

  return {
    populateList
  };
};
