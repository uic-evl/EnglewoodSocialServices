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

    rectList: []
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

    self.drawingRect = self.svg.append("rect");
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
    self.rectList.push(rect);

    console.log(App.models.censusData.getDataWithinBounds(rect));

    self.drawable = false;
    self.button.attr("class", "btn btn-success navbar-btn");
    self.dragLayer.classed("disabled", true);
    self.drawingRect
      .attr("width", 0)
      .attr("height", 0);

    if (self.rectList.length == 10) {
      self.button.attr("class", "btn btn-success navbar-btn disabled")
        .attr("disabled", true);
    }

    self.drawingStart = null;

  }

  return {
    attachDragLayer
  };
}
