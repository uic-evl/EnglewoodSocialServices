"use strict";

var App = App || {};

let SearchController = function() {
  let self = {
    input: null,
    button: null
  };

  function attachDOMElements(inputID, buttonID) {
    self.input = d3.select(inputID)
      .on("input", onInput);

    self.button = d3.select(buttonID)
      .on("click", onButtonClick);
  }

  function onInput(d) {
    console.log("Input:", self.input.node().value);
  }

  function onButtonClick(d) {
    console.log("Search:", self.input.node().value);
  }

  return {
    attachDOMElements
  };
};
