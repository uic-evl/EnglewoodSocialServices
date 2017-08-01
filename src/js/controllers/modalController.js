"use strict";

var App = App || {};

let modalController = function() {
  let self = {
    modal: null,
    body: null,
    acceptButton: null,
    orgSearchInput: null,
    counter: null,
    addressInput: null
  };

  function initalize(){

    self.modal = d3.select("#landing-page");
    self.body = self.modal.select(".modal-body");

    self.acceptButton = self.modal.select("#modalAcceptButton")
      .on('click', acceptButtonClicked);

    self.orgSearchInput = d3.selectAll("#modalSearchInput")
      .on("input", onInput)
      .on("keyup", function() {
        if (d3.event.keyCode == 13) {
          console.log("enter!");
          // hitting enter in the input is equivalent to pressing accept button
          acceptButtonClicked();
          $('#landing-page').modal('hide');

        }
      });

    self.addressInput = d3.select('#modalAddressInput')
      .on("keyup", function() {
        if (d3.event.keyCode == 13) {
          console.log("enter!");
          // hitting enter in the input is equivalent to pressing accept button
          acceptButtonClicked();
          $('#landing-page').modal('hide');
        }
      });

    self.counter = d3.selectAll("#modalSearchCount");
  }

  function setCount(count) {
    self.counter.html(count);
  }

  function onInput(d) {
    let searchTerm = _.lowerCase(self.orgSearchInput.node().value);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    // get number of elements in search
    self.counter.html(searchData.length);

    if (searchData.length === 0) {
      self.counter.classed("searchCountEmpty", true);
      d3.select(self.counter.node().parentNode).classed("searchCountEmpty", true);
    }
    else {
      self.counter.classed("searchCountEmpty", false);
     d3.select(self.counter.node().parentNode).classed("searchCountEmpty", false);
    }

  }

  function acceptButtonClicked(){

    var address = self.addressInput.node().value;
    if(address.length !== 0){
      App.controllers.locationButton.getLatLngFromAddress(address);
    }

    let orgSearchText = self.orgSearchInput.node().value;

    let searchTerm = _.lowerCase(orgSearchText);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    App.views.map.updateServicesWithFilter(searchData);
    App.views.serviceList.populateList(searchData);

    // d3.select("#searchInput").node().value = orgSearchText;
    App.controllers.search.countChanged(searchData);


  }

  initalize();

  return {
    setCount
  };
};
