"use strict";

var App = App || {};

let CircleSelectorController = function(buttonID) {
  let self = {
    button: null,
    dragLayer: null,
    svg: null,

    drawable: false,
    drawing: false,
    drawingCircle: false,
    drawingStart: null,

    circleList: []
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
      .on("mousedown", startCircleCreation)
      .on("mousemove", resizeCircle)
      .on("mouseup", finalizeCircle);

    self.drawingCircle = self.svg.append("circle");
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

  function startCircleCreation() {
    self.drawingStart = {
      x: d3.event.layerX,
      y: d3.event.layerY
    };

    self.drawingCircle
      .attr("cx", d3.event.layerX)
      .attr("cy", d3.event.layerY)
      .attr("r", 0);
  }

  function resizeCircle() {
    if (self.drawingStart) {
      let radius = Math.sqrt(
        Math.pow(d3.event.layerX - self.drawingStart.x, 2) +
        Math.pow(d3.event.layerY - self.drawingStart.y, 2)
      );

      self.drawingCircle.attr("r", radius);
    }
  }

  function finalizeCircle() {
    // send final values to map to create map circle, etc.
    let center = L.point(self.drawingStart.x, self.drawingStart.y);
    let radial = L.point(d3.event.layerX, d3.event.layerY);

    let circle = App.views.map.drawCircle(center, radial);
    self.circleList.push(circle);

    self.drawable = false;
    self.button.attr("class", "btn btn-success navbar-btn");
    self.dragLayer.classed("disabled", true);
    self.drawingCircle.attr("r", 0);

    if (self.circleList.length == 10) {
      self.button.attr("class", "btn btn-success navbar-btn disabled")
        .attr("disabled", true);
    }

    self.drawingStart = null;

  }

  return {
    attachDragLayer
  };
}
