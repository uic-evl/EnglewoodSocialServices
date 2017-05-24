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

    //remove previous entries
    self.serviceList.selectAll(".serviceEntry").remove();

    //add new entries
    self.serviceList.selectAll(".serviceEntry")
    .data(englewoodLocations)
    .enter()
    .append("div").attr("class", "serviceEntry")
    .each(function(d){
      var current = d3.select(this);
      current.append("h3").text(function(d) { return d["Organization Name"]; })
      current.append("h4").text(function(d) { return d.Address; })
      current.append("p").text(function(d) { return d["Description of Services Provided in Englewood"]; })
    });

  }

  return {
    populateList
  };
};
