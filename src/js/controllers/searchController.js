"use strict";

var App = App || {};

let SearchController = function() {
  let self = {
    input: null,
    counter: null,
    button: null
  };

  function attachDOMElements(inputID, counterID, buttonID) {
    self.input = d3.select(inputID)
      .on("input", onInput);

    self.counter = d3.select(counterID);

    self.button = d3.select(buttonID)
      .on("click", onButtonClick);
  }

  function setCount(count) {
    self.counter.html(count);
  }

  function onInput(d) {
    console.log("Input:", self.input.node().value);

    let searchTerm = self.input.node().value;

    let searchData = App.models.socialServices.getSearchedData(searchTerm);
    App.views.map.updateServicesWithFilter(searchData);

    // get number of elements in search
    self.counter.html(searchData.length);
    App.views.serviceList.populateList(searchData);

    if (searchData.length === 0) {
      self.counter.classed("searchCountEmpty", true);
    } else {
      self.counter.classed("searchCountEmpty", false);
    }
  }

  function onButtonClick(d) {
    console.log("Search:", self.input.node().value);

    let searchTerm = self.input.node().value;

    // update service list with search string

    let searchData = App.models.socialServices.getSearchedData(searchTerm);


    App.views.serviceList.populateList(searchData);
  }

  return {
    attachDOMElements,

    setCount
  };
};
