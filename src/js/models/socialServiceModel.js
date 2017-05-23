"use strict";

var App = App || {};

let SocialServiceModel = function() {
  let self = {
    data: null
  };

  init();

  function init() {

  }

  function loadData(dataPath) {
    return new Promise(function(resolve, reject) {
      d3.csv(dataPath, function(err, data) {
        if (err) reject(err);

        self.data = data;
        resolve();
      })
    });
  }

  function getData() {
    return self.data;
  }

  return {
    loadData,
    getData
  };
};
