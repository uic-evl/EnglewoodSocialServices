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
        .text(function(d) { return d["Organization Name"]; });

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

  return {
    populateList
  };
};
