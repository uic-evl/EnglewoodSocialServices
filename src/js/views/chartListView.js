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

  function createChart(properties) {
    let rgb = d3.rgb(properties.color);

    console.log(properties);

    self.chartList.append("div")
      .attr("class", "chartEntry")
      .attr("id", `rect${properties.id}`)
      .style("height", "200px")
      .style("border", `5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`)
      // .style("background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
      .style("background-color", "rgba(255,255,255,0.75)")
  }

  function removeChart(id) {
    self.chartList.select(`#rect${id}`).remove();
  }

  return {
    createChart,
    removeChart
  };
};
