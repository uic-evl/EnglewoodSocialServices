"use strict";

var App = App || {};

let LandInventoryModel = function () {
  let self = {
    data: null,
    splitData: {
      englewood: [],
      westEnglewood: []
    }
  };

  function loadCSV(path) {
    return App.controllers.dataDownload.getCsv(path);
  }

  function loadData() {
    let englewoodData, westEnglewoodData;
    const ePromise = loadCSV("./data/EnglewoodLandInventory.csv")
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

    const wePromise = loadCSV("./data/WestEnglewoodLandInventory.csv")
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
        self.splitData.englewood = englewoodData;
        self.splitData.westEnglewood = westEnglewoodData;
        self.data = englewoodData.concat(westEnglewoodData);
        console.log("Done loading land inventory data");
        console.log(self);
      });
  }

  function splitDataByEnglewood_WestEnglewood(){
    return self.splitData;
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
    getDataByFilter,
    splitDataByEnglewood_WestEnglewood
  };
};
