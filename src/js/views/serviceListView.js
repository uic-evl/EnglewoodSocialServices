"use strict";

var App = App || {};

let ServiceListView = function(listID) {
  let self = {
    serviceList: null,

    currentLocation: null
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
    .append("div").attr("class", "panel panel-info serviceEntry")
    .each(function(d){
      let panel = d3.select(this);

      // create heading
      let panelHeading = panel.append("div")
        .attr("class", "panel-heading");

      // create body
      let panelBody = panel.append("div")
        .attr("class", "panel-body");

      // create footer
      let panelFooter = panel.append("div")
        .attr("class", "panel-footer");

      // add organization name to heading
      panelHeading.append("h4")
        .attr("class", "orgName")
        .text(function(d) { return d["Organization Name"]; })
      .append("small")
        .attr("class", "serviceDistance");
        // .html("<br>");

      if (self.currentLocation) {
        sortLocations(self.currentLocation);
      }

      // add description to body
      panelBody.append("p").text(function(d) { return d["Description of Services Provided in Englewood"]; });

      // add link to address in footer
      panelFooter.append("a")
        .attr("href", "http://maps.google.com/?q=" + d["Address"])
        .attr("target", "_blank")
        .html(function(d) {
          return "<span class='glyphicon glyphicon-share-alt'></span> " +
          d["Address"];
        });

    });

  }

  function sortLocations(currentLocation) {
    self.currentLocation = currentLocation;

    if (!currentLocation) {
      self.serviceList.selectAll(".serviceEntry")
        .selectAll(".panel-heading")
        .selectAll(".serviceDistance")
        .text("");
    } else {
      self.serviceList.selectAll(".serviceEntry")
        .sort(function(a, b) {
          let locA = {lat: a.Y, lng: a.X};
          let locB = {lat: b.Y, lng: b.X};

          let distA = calculateDistance(locA, currentLocation);
          let distB = calculateDistance(locB, currentLocation);

          return distA - distB;
        })
        .selectAll(".panel-heading")
        .selectAll(".serviceDistance")
        .html(function(d) {
          let loc = {lat: d.Y, lng: d.X};

          return "<br>" + calculateDistance(loc, currentLocation).toFixed(2) + " m";
        });
    }

  }

  function calculateDistance(pos1, pos2) {
    const R = 6371e3; // metres
    let φ1 = toRadians(pos1.lat);
    let φ2 = toRadians(pos2.lat);
    let Δφ = toRadians(pos2.lat-pos1.lat);
    let Δλ = toRadians(pos2.lng-pos1.lng);

    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let d = R * c;

    return d;

    function toRadians(deg) {
      return deg * Math.PI / 180;
    }
  }

  return {
    populateList,

    sortLocations
  };
};
