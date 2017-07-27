"use strict";

var App = App || {};

let modalController = function() {
  let self = {
    modal: null,
    body: null,
    acceptButton: null,
    categorySelection: null,
    orgSearchInput: null,
    counter: null
  };

  function initalize(){

    self.modal = d3.select("#landing-page");
    self.body = self.modal.select(".modal-body");

    self.acceptButton = self.modal.select("#modalAcceptButton")
      .on('click', acceptButtonClicked);

    self.orgSearchInput = d3.selectAll("#modalSearchInput")
      .on("input", onInput);

    self.counter = d3.selectAll("#modalSearchCount");
  }

  function setCount(count) {
    self.counter.html(count);
  }

  function onInput(d) {
    let searchTerm = _.lowerCase(d3.select("#modalSearchInput").node().value);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    // get number of elements in search
    self.counter.html(searchData.length);

    if (searchData.length === 0) {
      self.counter.classed("searchCountEmpty", true);
    } 
    else {
     self.counter.classed("searchCountEmpty", false);
    }

  }

  function acceptButtonClicked(){

    var address = d3.select('#modalAddressInput').node().value;
    if(address.length != 0){
      App.controllers.locationButton.getLatLngFromAddress(address);
    }

    let orgSearchText = self.orgSearchInput.node().value;
    if(orgSearchText.length != 0){
      let searchTerm = _.lowerCase(orgSearchText);

      let searchData = App.models.socialServices.getSearchedData(searchTerm);

      App.views.map.updateServicesWithFilter(searchData);
      App.views.serviceList.populateList(searchData);

      d3.select("#searchInput").node().value = orgSearchText;
      App.controllers.search.onInput();
    }
    
  }

  initalize();

  return {
    setCount
  };
};
