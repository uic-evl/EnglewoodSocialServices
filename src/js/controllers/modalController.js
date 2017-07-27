"use strict";

var App = App || {};

let modalController = function() {
  let self = {
    modal: null,
    body: null,
    locationButton: null,
    categorySelection: null,
  };

  function test(){
    console.log("nice fam");
    self.modal = d3.select("#landing-page");
    self.body = self.modal.select(".modal-body");

    self.locationButton = self.modal.select("#modalAcceptButton")
      .on('click', acceptButtonClicked);
  }

  function acceptButtonClicked(){
    console.log("clicked@!!@!@");
    var address = d3.select('#modalAddressInput').node().value;
    console.log("Modal address: " + address);
    App.controllers.locationButton.getLatLngFromAddress(address);
  }


  test();

  return {
  };
};
