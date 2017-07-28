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
    selections: {},
    propertyScales: null,
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

  function createChart(property_data) {
    // let rgb = d3.rgb(property_data.color);

    console.log("createChart",property_data);

    self.chartList.append("div")
      .datum(property_data)
      .attr("class", "panel panel-default chartEntry")
      .attr("id", createPropertyID(property_data))
      // .style("height", "200px")
      // .style("border", `5px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`)
      // .style("background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`)
      // .style("background-color", "rgba(255,255,255,0.75)")
      .each(setupChart);

    //already done in setupChart
    // self.chartList.selectAll(".chartEntry")
    //   .each(updateChart);
  }

  function setupChart(property_data) {
    // let rgb = d3.rgb(d.color);

    let panel = d3.select(this);

    let heading = panel.append("div").attr("class", "panel-heading").append('div').classed('row',true);
      // .style("background-color", d.color);

    let mainTypeTitle = property_data.mainType.split("_").map((d) => { return `${d[0].toUpperCase()}${d.slice(1).toLowerCase()}`; }).join(" ");
    let propertyTitle = heading.append('h4').attr('class', 'col-md-10 propertyTitle').html(`<b>${mainTypeTitle}:</b> ${property_data.subType.replace(/[^a-zA-Z0-9 ]/g, "")} (/mi<sup>2</sup>)`);
    let closeButton = heading.append('h4').append('span').attr('class', 'col-md-2 glyphicon glyphicon-remove text-right')
      .on('click',function(){
        removePropertyChart(property_data);
        App.controllers.mapData.removeChartFromList(property_data);
      });
    
    // let area = heading.append("h4").attr("class", "rectArea").html(`Area (mi<sup>2</sup>): ${d.area.toFixed(2)}`);

    let body = panel.append("div").attr("class", "panel-body");

    let chart = body.append("svg");

    let graph = chart.append('g').classed('graph-group',true);

    graph.background = graph.append("rect")
      .attr("x", self.chartMargins.left)
      .attr("y", self.chartMargins.top)
      .attr("width", chart.node().clientWidth - self.chartMargins.left - self.chartMargins.right)
      .attr("height", chart.node().clientHeight - self.chartMargins.top - self.chartMargins.bottom)
      .classed('graph-background',true).attr('property-data', JSON.stringify(property_data))
      .style('stroke','none');
    graph.content = graph.append('g').classed('graph-content',true);

    updateChart(createPropertyID(property_data));
  }

  //redraw selection bars
  function updateChart(chartID) {
    if(typeof chartID === "object"){ //given a property object
      chartID = createPropertyID(chartID);
    }
    console.log("updating chart",chartID);
    let chart = self.chartList.select(`#${chartID}`);
    let graph = chart.select('.graph-group');
    try{
      graph.selectAll('.error-text').remove();
      graph.selectAll('g.graph-content').remove();
      graph.background = graph.select('.graph-background');
      graph.content = graph.append('g').classed('graph-content',true);
      let property_data = JSON.parse(graph.background.attr('property-data'));
      
      let selectionKeys = Object.keys(self.selections);
      let boundsX = [0, +graph.background.attr('width')];
      let xScale = d3.scaleLinear().domain([0, selectionKeys.length]).range(boundsX);
      let barWidth = xScale.range()[1] / selectionKeys.length;
      let data = [];
      for(let s of selectionKeys){
        let curSelection = self.selections[s];
        let area = curSelection.area;
        let propertyValue = curSelection.data.census[property_data.mainType][property_data.subType];
        //show data relative to area (i.e. density)
        data.push({
          value: propertyValue / area,
          color: curSelection.color
        });
      }
      if(data.length > 1){

        let boundsY = [+graph.background.attr('height'), 0];
        let yScale = d3.scaleLinear().domain([0, d3.max(data,(d) => {return d.value;})]).range(boundsY);
        let xOffset = +graph.background.attr('x'), yOffset = +graph.background.attr('y');
        let yMax = yScale.domain()[1];
        graph.content.selectAll('.bar').data(data)
        .enter().append('rect').each(function (data_entry, index) {
          console.log(data_entry);
          d3.select(this).classed('bar', true)
          .attr('x', xOffset + xScale(index)).attr('y', yOffset + yScale(data_entry.value))
          .attr('width', barWidth).attr('height', yScale(yMax - data_entry.value))
          .style('fill', data_entry.color)//.attr('title', race);
        });
        
        let yAxis = d3.axisLeft(yScale).tickValues([yScale.domain()[0],(yScale.domain()[1]-yScale.domain()[0])/2,yScale.domain()[1]]);
        graph.content.append('g').classed('axis',true)
        .attr('transform',`translate(${xOffset},${yOffset})`).call(yAxis);
      }else{
        graph.content.append('text')
          .attr("x", self.chartMargins.left + 5)
          .attr("y", self.chartMargins.top + 15)
          .text(`Please make ${2 - data.length} more ${2-data.length === 1 ? "selection":"selections"}`);
      }
    }catch(err){
      //fall back for error
      console.log("chart draw error", err);
      graph.select('.graph-content').remove();

      graph.append("text").classed('error-text', true)
        .attr("x", self.chartMargins.left + 5)
        .attr("y", self.chartMargins.top + 15)
        .text(`Error occurred while drawing selections`);
    }
  }
  
  function createPropertyID(property_data){
    let mainTypeTitle = property_data.mainType.split("_").map((d) => { return `${d[0].toUpperCase()}${d.slice(1).toLowerCase()}`; }).join("_");
    let subTypeTitle = property_data.subType.split(" ").join("_");
    return `${mainTypeTitle}__${subTypeTitle}`.replace(/[^a-zA-Z0-9_]/g,""); //remove any non-alpha numberic characters except underscores
  }

  function addPropertyChart(property_data){
    console.log("addProperty",property_data);
    if(self.chartList.selectAll(`#${createPropertyID(property_data)}`).empty()){
      createChart(property_data);
    }else{
      console.log("Already exists");
    }
  }

  function removePropertyChart(property_data){
    removeChart(createPropertyID(property_data));
  }

  function addSelection(properties){
    console.log("addSelection",properties);
    self.selections[properties.id.toString()] = properties;

    updatePropertyExtents();

    self.chartList.selectAll('.chartEntry')
      .each(updateChart);
  }

  function removeSelection(id){
    if(typeof id === "object"){ //id is a properties object
      delete self.selections[id.id.toString()];
    }else{
      delete self.selections[id.toString()];
    }

    updatePropertyExtents();
    self.chartList.selectAll(".chartEntry")
      .each(updateChart);
  }

  function removeChart(id) {
    self.chartList.select(`#${id}`).remove();

    updatePropertyExtents();

    self.chartList.selectAll(".chartEntry")
      .each(updateChart);
  }

  function updatePropertyExtents() {
    console.log("Temporarily disabled updatePropertyExtents");
    // for (let dataSource of Object.keys(self.propertyScales)) {
    //   for (let property of Object.keys(self.propertyScales[dataSource])) {
    //     for (let subproperty of Object.keys(self.propertyScales[dataSource][property])) {
    //       self.propertyScales[dataSource][property][subproperty].domain(
    //         d3.extent(d3.selectAll(".chartEntry").nodes(), (node) => {
    //           // get that data value from node
    //           let rect = d3.select(node).datum();
    //           return rect.data[dataSource][property][subproperty] / rect.area;
    //         }));

    //       console.log(dataSource, property, subproperty, self.propertyScales[dataSource][property][subproperty].domain());
    //     }
    //   }
    // }
  }

  return {
    createChart,
    removeChart,
    addPropertyChart,
    removePropertyChart,
    addSelection,
    removeSelection
  };
};
