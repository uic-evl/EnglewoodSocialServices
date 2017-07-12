"use strict";

var App = App || {};

let ChartListView = function(listID) {
  let self = {
    chartHeight: 250,
    chartMargins: {
      top: 10,
      right: 10,
      bottom: 25,
      left: 25
    },
    chartList: null,

    propertyScales: null
  };

  init();

  function init() {
    self.chartList = d3.select(listID)

    self.propertyScales = {
      census: {
        "TOTAL_POPULATION": {
          "Total": d3.scaleLinear()
        }
      }


    }
  }

  function createChart(properties) {
    let rgb = d3.rgb(properties.color);

    console.log(properties);

    self.chartList.append("div")
      .datum(properties)
      .attr("class", "panel panel-default chartEntry")
      .attr("id", `rect${properties.id}`)
      // .style("height", "200px")
      // .style("border", `5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`)
      .style("background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`)
      // .style("background-color", "rgba(255,255,255,0.75)")
      .each(setupChart);

      updatePropertyExtents();

    self.chartList.selectAll(".chartEntry")
      .each(updateChart);
  }

  function setupChart(d) {
    let rgb = d3.rgb(d.color);

    // console.log("Setup:", d.id);
    let panel = d3.select(this);

    let heading = panel.append("div").attr("class", "panel-heading")
      .style("background-color", d.color);

    let area = heading.append("h4").attr("class", "rectArea").html(`Area (mi<sup>2</sup>): ${d.area.toFixed(2)}`);
      // .html(`Area (mi<sup>2</sup>): ${d.area.toFixed(2)}`);

    let body = panel.append("div").attr("class", "panel-body");

    let chart = body.append("svg");

    chart.append("rect")
      .attr("x", self.chartMargins.left)
      .attr("y", self.chartMargins.top)
      .attr("width", chart.node().clientWidth - self.chartMargins.left - self.chartMargins.right)
      .attr("height", chart.node().clientHeight - self.chartMargins.top - self.chartMargins.bottom);
  }

  function updateChart(d) {
    // console.log("Update:", d.id);

  }

  function removeChart(id) {
    self.chartList.select(`#rect${id}`).remove();

    updatePropertyExtents();

    self.chartList.selectAll(".chartEntry")
      .each(updateChart);
  }

  function updatePropertyExtents() {
    for (let dataSource of Object.keys(self.propertyScales)) {
      for (let property of Object.keys(self.propertyScales[dataSource])) {
        for (let subproperty of Object.keys(self.propertyScales[dataSource][property])) {
          self.propertyScales[dataSource][property][subproperty].domain(
            d3.extent(d3.selectAll(".chartEntry").nodes(), (node) => {
              // get that data value from node
              let rect = d3.select(node).datum();
              return rect.data[dataSource][property][subproperty] / rect.area;
            }));

          console.log(dataSource, property, subproperty, self.propertyScales[dataSource][property][subproperty].domain());
        }
      }
    }
  }

  return {
    createChart,
    removeChart
  };
};
