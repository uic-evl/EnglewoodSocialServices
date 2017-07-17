"use strict";

var App = App || {};

let SearchController = function() {
  let self = {
    input: null,
    counter: null,
    button: null,

    lastSearchedTerm: null
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

    // get number of elements in search
    self.counter.html(searchData.length);

    // uncomment if update on any text entry
    // App.views.map.updateServicesWithFilter(searchData);
    // App.views.serviceList.populateList(searchData);

    if (searchData.length === 0) {
      self.counter.classed("searchCountEmpty", true);
    } else {
      self.counter.classed("searchCountEmpty", false);
    }

    if (self.lastSearchedTerm !== _.lowerCase(searchTerm)) {
      self.button.attr("class", "btn btn-success")
        .attr("disabled", null);
    } else {
      self.button.attr("class", "btn btn-default")
        .attr("disabled", true);
    }
  }

  function onButtonClick(d) {
    console.log("Search:", self.input.node().value);

    let searchTerm = _.lowerCase(self.input.node().value);
    // has to do with state of list
    self.lastSearchedTerm = searchTerm;

    // update service list with search string

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    App.views.map.updateServicesWithFilter(searchData);
    App.views.serviceList.populateList(searchData);

    self.button.attr("class", "btn btn-default")
      .attr("disabled", true);
  }

  return {
    attachDOMElements,

    setCount
  };
};
