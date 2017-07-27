"use strict";

let MapDataController = function() {
  let self = {
    dataDropdownList: null,

    toggleButton: null,
    mapDataPanel: null,
    resetButton: null
  };

  function setDataDropdown(id) {
    self.dataDropdownList = d3.select(id);
  }

  function setupDataPanel(buttonID, listWrapperID) {
    self.mapDataPanel = d3.select(listWrapperID)
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("height", window.innerHeight - d3.select(".navbar").node().clientHeight + "px");

    self.toggleButton = d3.select(buttonID).classed("open", false)
      .on("click", function(d) {
        let open = !d3.select(this).classed("open");
        d3.select(this).classed("open", open);

        d3.select(this).select(".glyphicon").attr("class", open ? "glyphicon glyphicon-arrow-up" : "glyphicon glyphicon-arrow-down");

        self.mapDataPanel
          .style("pointer-events", open ? "all" : "none")
          .style("opacity", open ? 1 : 0);
      });
  }

  function attachResetOverlayButton(id) {
    self.resetButton = d3.select(id)
      .on("click", resetOverlay);
  }

  function resetOverlay() {
    App.views.map.drawChoropleth();
    console.log("Reset Overlay");
  }

  function populateDropdown(categories) {
    // populate census data dropdown
    self.mapDataPanel.select("#mapSettings").selectAll(".censusType")
      .data(Object.keys(categories))
      .enter().append("div")
      .attr("class", "panel panel-default censusType")
      .each(function(c1) {
        let panel = d3.select(this);

        // create link within tab
        panel.append("div")
          .attr("class", "panel-heading")
          .attr("data-toggle", "collapse")
          .attr("href", "#" + _.kebabCase("main_" + c1))
          .html(_.capitalize(_.startCase(c1)));

        // create tab content div for this t1 category
        let panelBody = panel.append("div")
          .attr("class", "panel-collapse collapse")
          .attr("id", _.kebabCase("main_" + c1))
          .append("div")
          .attr("class", "panel-body");

        panelBody.selectAll(".censusSubtype")
          .data(categories[c1])
          .enter().append("div")
          .attr("class", "row censusSubtype")
          .datum(function(c2) {
            return {
              mainType: c1,
              subType: c2
            };
          })
          .attr("id", d => _.kebabCase("sub_" + d.subType))
          .each(function(d) {
            let row = d3.select(this);

            row.append("span")
              .html(function(d) {
                return d.subType;
              });

            let btnGroup = row.append("div")
              .attr("class", "btn-group");

            btnGroup.append("button")
              .attr("class", "btn btn-success")
              .text("Chart");

            btnGroup.append("button")
              .attr("class", "btn btn-success")
              .text("Map")
              .on("click", mapButtonClick);
          });
      });
  }

  function mapButtonClick(d) {
    // d3.event.stopPropagation(); // prevent menu close on link click

    // toggle whether or not it is selected
    console.log(d);

    let reducedData = App.models.censusData.getSubsetGeoJSON(d);
    App.views.map.drawChoropleth(reducedData);
  }

  function chartButtonClick(d) {

  }

  return {
    setupDataPanel,
    attachResetOverlayButton,

    populateDropdown
  }
}
