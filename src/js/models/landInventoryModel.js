"use strict";

var App = App || {};

let LandInventoryModel = function () {
  let self = {
    data: null
  };

  function loadCSV(path) {
    return new Promise(function (fulfill, reject) {
      d3.csv(path, function (error, csv) {
        if (error) reject(error);

        fulfill(csv);
      });
    });
  }

  function loadJSON(path) {
    return new Promise(function (fulfill, reject) {
      d3.json(path, function (error, json) {
        if (error) reject(error);

        console.log(json.length);
        fulfill(json);
      });
    });
  }

  function loadData() {
    let englewoodData, westEnglewoodData;
    // let ePromise = loadJSON("./data/EnglewoodLandInventory.json")
    let ePromise = loadCSV("./data/EnglewoodLandInventory.csv")
      .then((data) => {
        englewoodData = data.map((c) => { 
          c.Area = "Englewood"; 

          //extract coordinates from location field
          let coords = c.Location.slice(c.Location.lastIndexOf("(") + 1).replace(")", "").split(",");
          c.Latitude = coords[0];
          c.Longitude = coords[1];

          return c; 
        });
        return;
      });
    // let wePromise = loadJSON("./data/WestEnglewoodLandInventory.json")
    let wePromise = loadCSV("./data/WestEnglewoodLandInventory.csv")
      .then((data) => {
        westEnglewoodData = data.map((c) => { 
          c.Area = "West Englewood";
        
          //extract coordinates from location field
          let coords = c.Location.slice(c.Location.lastIndexOf("(") + 1).replace(")", "").split(",");
          c.Latitude = coords[0];
          c.Longitude = coords[1];

          return c;
        });
        return;
      });

    return Promise.all([ePromise, wePromise])
      .then(() => {
        self.data = englewoodData.concat(westEnglewoodData);
        console.log("Done loading land inventory data");
        console.log(self);
      });
  }

  function getDataByFilter(filterFn) {
    if(!filterFn) return self.data;
    console.time("getDataByFilter");
    let results = _.filter(self.data, filterFn);
    console.timeEnd("getDataByFilter");
    return results;
  }

  return {
    loadData,
    getDataByFilter
  };
};