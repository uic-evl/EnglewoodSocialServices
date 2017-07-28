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
    self.mapDataPanel.selectAll(".mapButton").each(removeMap);
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
        let panelHeading = panel.append("div")
          .attr("class", "panel-heading")
          .attr("data-toggle", "collapse")
          .attr("href", "#" + _.kebabCase("main_" + c1));

        let title = panelHeading.append("span")
          .attr("class", "panelTitle")
          .text(_.capitalize(_.startCase(c1)));

        let numCharts = panelHeading.append("span")
          .attr("class", "label label-success numCharts")
          .attr("data-count", 0)
          .style("display", "none")
          .text("0 Charts");

        let hasMap = panelHeading.append("span")
          .attr("class", "label label-success hasMap")
          .style("display", "none")
          .text("Map");

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
              .attr("class", "btn btn-success chartButton")
              .text("Chart")
              .on("click", chartButtonClick);

            btnGroup.append("button")
              .attr("class", "btn btn-success mapButton")
              .text("Map")
              .on("click", mapButtonClick);
          });
      });
  }

  function mapButtonClick(d) {
    // d3.event.stopPropagation(); // prevent menu close on link click

    // toggle whether or not it is selected
    if (d3.select(this).classed("btn-danger")) {
      removeMap.call(this, d);
      App.views.map.drawChoropleth();
    } else {
      self.mapDataPanel.selectAll(".mapButton").each(removeMap);

      addMap.call(this, d);
      let reducedData = App.models.censusData.getSubsetGeoJSON(d);
      App.views.map.drawChoropleth(reducedData);
    }

    // let reducedData = App.models.censusData.getSubsetGeoJSON(d);
    // App.views.map.drawChoropleth(reducedData);
  }

  function addMap(d) {
    // update panel-heading
    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");

    let mapLabel = panelHeading.selectAll(".hasMap");
    mapLabel.style("display", "inline");
    d3.select(this).attr("class", "btn btn-danger mapButton");
  }

  function removeMap(d) {
    // update panel-heading
    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");

    let mapLabel = panelHeading.selectAll(".hasMap");
    mapLabel.style("display", "none");
    d3.select(this).attr("class", "btn btn-success mapButton");
  }

  function chartButtonClick(d) {
    console.log("Create chart for", d);
    // chart exists already
    if (d3.select(this).classed("btn-danger")) {
      removeChart.call(this, d);
      App.views.chartList.removePropertyChart(d);
    } else {
      addChart.call(this, d);
      App.views.chartList.addPropertyChart(d);
    }
  }

  function addChart(d) {
    d3.select(this).attr("class", "btn btn-danger chartButton");

    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");
    // update chart Number

    let chartLabel = panelHeading.selectAll(".numCharts");
    let numCharts = +chartLabel.attr("data-count")+1;

    chartLabel.attr("data-count", numCharts)
      .text(numCharts + (numCharts === 1 ? " Chart" : " Charts"))
      .style("display", numCharts <= 0 ? "none": "inline");
  }

  function removeChart(d) {
    d3.select(this).attr("class", "btn btn-success chartButton");

    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");
    // update chart Number

    let chartLabel = panelHeading.selectAll(".numCharts");
    let numCharts = +chartLabel.attr("data-count") - 1;

    chartLabel.attr("data-count", numCharts)
      .text(numCharts + (numCharts === 1 ? " Chart" : " Charts"))
      .style("display", numCharts <= 0 ? "none" : "inline");
  }

  function removeChartFromList(propertyTypes) {
    d3.selectAll("#" + _.kebabCase("main_" + propertyTypes.mainType)).selectAll("#" + _.kebabCase("sub_" + propertyTypes.subType))
      .select(".chartButton")
      .each(removeChart);
  }

  return {
    setupDataPanel,
    attachResetOverlayButton,

    populateDropdown,
    removeChartFromList
  };
}
