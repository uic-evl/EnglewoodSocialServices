"use strict";

var App = App || {};

let ChartListView = function(listID) {
  let self = {
    chartList: null
  };

  init();

  function init() {
    self.chartList = d3.select(listID).select("#accordion");
  }

  return {

  };
};
