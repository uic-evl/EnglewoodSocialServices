"use strict";

var App = App || {};

let RectSelectorController = function(buttonID) {
  let self = {
    button: null,
    dragLayer: null,
    svg: null,

    drawable: false,
    drawing: false,
    drawingRect: false,
    drawingStart: null,

    rects: {}
  };

  init();

  function init() {
    self.button = d3.select(buttonID)
      .on("click", handleButtonClick);
  }

  function attachDragLayer(id) {
    self.dragLayer = d3.select(id).select(function() {
        return this.parentNode.appendChild(this.cloneNode(false));
      })
      .attr("id", "dragLayer")
      .attr("class", "disabled")

    self.svg = self.dragLayer.append("svg")
      .on("mousedown", startRectCreation)
      .on("mousemove", resizeRect)
      .on("mouseup", finalizeRect);

    self.drawingRect = self.svg.append("rect")
      .style("stroke-dasharray", "5, 5");
  }

  function handleButtonClick() {
    self.drawable = !self.drawable;

    if (self.drawable) {
      self.button.attr("class", "btn btn-danger navbar-btn");
      self.dragLayer.classed("disabled", false);
    } else {
      self.button.attr("class", "btn btn-success navbar-btn");
      self.dragLayer.classed("disabled", true);
    }
  }

  function startRectCreation() {
    self.drawingStart = {
      x: d3.event.layerX,
      y: d3.event.layerY
    };

    self.drawingRect
      .attr("x", d3.event.layerX)
      .attr("y", d3.event.layerY)
      .attr("width", 0)
      .attr("height", 0);
  }

  function resizeRect() {
    if (self.drawingStart) {

      self.drawingRect.attr("width", Math.abs(d3.event.layerX - self.drawingStart.x));
      self.drawingRect.attr("height", Math.abs(d3.event.layerY - self.drawingStart.y));

      if (self.drawingStart.x > d3.event.layerX) {
        self.drawingRect.attr("x", d3.event.layerX);
      }

      if (self.drawingStart.y > d3.event.layerY) {
        self.drawingRect.attr("y", d3.event.layerY);
      }
    }
  }

  function finalizeRect() {
    // send final values to map to create map rect, etc.
    let b1 = L.point(self.drawingStart.x, self.drawingStart.y);
    let b2 = L.point(d3.event.layerX, d3.event.layerY);

    let rect = App.views.map.drawRect(b1, b2);
    let censusData = App.models.censusData.getDataWithinBounds(rect.bounds);

    console.log(censusData);

    self.rects[rect.id] =  {
      bounds: rect.bounds,
      area: censusData.area * 3.86102e-7, // meters to miles
      data: {
        census: censusData.dataTotals
      },
      color: rect.color,
      id: rect.id,
      remove: () => { return removeRect(rect.id); } //used for remove button on graphs
    };

    // App.views.chartList.createChart(self.rects[rect.id]);
    App.views.chartList.addSelection(self.rects[rect.id]);

    // self.drawable = false;
    // self.button.attr("class", "btn btn-success navbar-btn");
    // self.dragLayer.classed("disabled", true);
    self.drawingRect
      .attr("width", 0)
      .attr("height", 0);

    if (Object.keys(self.rects).length >= 10) {
      self.drawable = false;
      self.button.attr("class", "btn btn-success navbar-btn disabled")
        .attr("disabled", true);
      self.dragLayer.classed("disabled", true);
    }

    self.drawingStart = null;

  }

  function removeRect(id) {
    console.log("Controller removing rect:", id);

    if (self.rects[id]) {
      App.views.map.removeRect(id);
      App.views.chartList.removeSelection(id);

      delete self.rects[id];

      if (Object.keys(self.rects).length >= 10) {
        self.button.attr("class", "btn btn-success navbar-btn disabled")
          .attr("disabled", true);
      } else {
        self.button.attr("class", "btn btn-success navbar-btn")
          .attr("disabled", null);
      }
    }

  }

  return {
    attachDragLayer,

    removeRect
  };
}
