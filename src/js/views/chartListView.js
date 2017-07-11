"use strict";

var App = App || {};

let ChartListView = function(listID) {
  let self = {
    chartList: null,


    properties: null,
    propertyScales: null
  };

  init();

  function init() {
    self.chartList = d3.select(listID).select("#accordion");
  }

  function createChart(properties) {
    let rgb = d3.rgb(properties.color);

    console.log(properties);

    self.chartList.append("div")
      .datum(properties)
      .attr("class", "chartEntry")
      .attr("id", `rect${properties.id}`)
      .style("height", "200px")
      .style("border", `5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`)
      // .style("background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
      .style("background-color", "rgba(255,255,255,0.75)")
      .each(setupChart);

    self.chartList.selectAll(".chartEntry")
      .each(updateChart)
  }

  function setupChart(d) {
    console.log("Setup:", d.id);
    d3.select(this)
      .html(`Area (mi<sup>2</sup>): ${d.area.toFixed(2)}<br> Population Density:
        ${(d.data.census["TOTAL_POPULATION"].Total / d.area).toFixed(2)}`
      );
  }

  function updateChart(d) {
    console.log("Update:", d.id);
  }

  function removeChart(id) {
    self.chartList.select(`#rect${id}`).remove();

    self.chartList.selectAll(".chartEntry")
      .each(updateChart)
  }

  return {
    createChart,
    removeChart
  };
};
