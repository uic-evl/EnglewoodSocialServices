"use strict";

var App = App || {};

let CensusDataModel = function() {
  let self = {
    gridData: null,
    mapTypeNames: null
  };

  function loadData() {
    // load mapTypeNames.json as well as allDataGrid.geojson
    let allDataGridP = new Promise(function(resolve, reject) {
      d3.json("./data/allDataGrid.geojson", function(err, json) {
        if (err) reject(err);

        self.gridData = json;

        resolve(json);
      });
    });

    let mapTypeNamesP = new Promise(function(resolve, reject) {
      d3.json("./data/mapTypeNames.json", function(err, json) {
        if (err) reject(err);

        self.mapTypeNames = json;

        resolve(json);
      });
    });

    return Promise.all([allDataGridP, mapTypeNamesP]);
  }

  function getSubsetGeoJSON(property, subproperty) {

  }

  function getDataWithinBounds(bounds) {
    let boundData = {};

    for (let property of Object.keys(self.mapTypeNames)) {
      boundData[property] = {};

      for (let subproperty of self.mapTypeNames[property]) {
        boundData[property][subproperty] = 0;
      }
    }

    for (let feature of self.gridData.features) {

    }

    return boundData;
  }

  return {
    loadData,
    getSubsetGeoJSON,
    getDataWithinBounds
  };
};
