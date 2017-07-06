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

  return {
    loadData,
    getSubsetGeoJSON
  };
};
