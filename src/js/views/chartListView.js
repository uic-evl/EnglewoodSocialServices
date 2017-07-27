"use strict";

var App = App || {};

let ChartListView = function(listID) {
  let self = {
    chartHeight: 200,
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
        },
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

    let body = panel.append("div").attr("class", "panel-body");

    let chart = body.append("svg");

    let graph = chart.append('g').classed('graph-group',true);

    graph.background = graph.append("rect")
      .attr("x", self.chartMargins.left)
      .attr("y", self.chartMargins.top)
      .attr("width", chart.node().clientWidth - self.chartMargins.left - self.chartMargins.right)
      .attr("height", chart.node().clientHeight - self.chartMargins.top - self.chartMargins.bottom);

    //graph statistics on race
    if(d.data.census.RACE){
      let raceData = d.data.census.RACE;
      let categories = Object.keys(raceData).filter((c) => {return c !== 'Total:'; })
        .sort((a,b) => { //alphabetical order
            if(a < b){
              return -1;
            }else{
              return 1;
            }
        });
      let boundsX = [0, +graph.background.attr('width')];
      let boundsY = [+graph.background.attr('height'), 0];
      let xScale = d3.scaleLinear().domain([0,categories.length]).range(boundsX);
      let yScale = d3.scaleLinear().domain([0, raceData['Total:']]).range(boundsY);
      let percentScale = d3.scaleLinear().domain(yScale.domain()).range([0,100]);
      let xOffset = +graph.background.attr('x'), yOffset = +graph.background.attr('y');
      let barWidth = xScale.range()[1] / categories.length;
      graph.selectAll('.bar').data(categories)
        .enter().append('rect')
        .each(function(race,index){ 
           d3.select(this).classed('bar',true)
             .attr('x', xOffset + xScale(index)).attr('y', yOffset + yScale(raceData[race]))
             .attr('width', barWidth).attr('height', yScale(raceData['Total:'] - raceData[race]))
             .style('fill','gray').attr('title',race).attr('value',percentScale(raceData[race]) + "%")
        })
      // console.log(raceData['Total:']);
    }else{ //fall back in case field doesn't exist     
      chart.append("text")
      .attr("x", self.chartMargins.left + 5)
      .attr("y", self.chartMargins.top + 15)
      .text(`Population Density (/mi^2): ${(d.data.census["TOTAL_POPULATION"].Total / d.area).toFixed(2)}`);
      
      chart.append("text")
      .attr("x", self.chartMargins.left + 5)
      .attr("y", self.chartMargins.top + 35)
      .text(`Family Density (/mi^2): ${(d.data.census["FAMILIES"].Total / d.area).toFixed(2)}`);
    }
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
