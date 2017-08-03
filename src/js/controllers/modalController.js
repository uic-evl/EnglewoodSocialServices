"use strict";

var App = App || {};

let modalController = function() {
  let self = {
    modal: null,
    body: null,
    acceptButton: null,
    orgSearchInput: null,
    counter: null,
    addressInput: null,
    backButton: null
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
        }
      });

    self.addressInput = d3.select('#modalAddressInput')
      .on("input", changeButtonState)
      .on("keyup", function() {
        if (d3.event.keyCode == 13) {
          console.log("enter!");
          // hitting enter in the input is equivalent to pressing accept button
          acceptButtonClicked();
        }
      });

    self.counter = d3.selectAll("#modalSearchCount");

    self.backButton = d3.selectAll("#backToSearchButton")
      .on("click", function(){
        App.controllers.serviceFilterDropdown.resetFilters();
        self.orgSearchInput.node().value = "";
        self.addressInput.node().value = "";
        document.getElementById("addressclear").style.display="none";
        document.getElementById("searchclear").style.display="none";
        onInput();

      });
    
  }

  function setCount(count) {
    self.counter.html(count);
  }

  function onInput(d) {
    let searchTerm = _.lowerCase(self.orgSearchInput.node().value);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    countChanged(searchData);

    changeButtonState();
  }

  function countChanged(data) {
    // get number of elements in search
    self.counter.html(data.length);

    if (data.length === 0) {
      self.counter.classed("searchCountEmpty", true);
      d3.select(self.counter.node().parentNode).classed("searchCountEmpty", true);
    }
    else {
      self.counter.classed("searchCountEmpty", false);
     d3.select(self.counter.node().parentNode).classed("searchCountEmpty", false);
    }
  }

  function changeButtonState(){
    let orgSearchText = self.orgSearchInput.node().value;

    let searchTerm = _.lowerCase(orgSearchText);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    var address = self.addressInput.node().value;

    var service = document.getElementById("currentServiceSelection").innerHTML;
    if(searchTerm.length != 0 || address.length != 0 || !service.includes("Select Services...")){
      $('#modalAcceptButton').removeClass("disabled");
    }
    else{
      $('#modalAcceptButton').addClass("disabled");
    }
  }

  function acceptButtonClicked(){

    let orgSearchText = self.orgSearchInput.node().value;

    let searchTerm = _.lowerCase(orgSearchText);

    let searchData = App.models.socialServices.getSearchedData(searchTerm);

    var address = self.addressInput.node().value;

    var service = document.getElementById("currentServiceSelection").innerHTML;
    //make sure at least one option is chosen
    console.log(service);
    if(searchTerm.length == 0 && address.length == 0 && service.includes("Select Services...")){
      console.log("its empty!!");
    }
    else{
      if(address.length !== 0){
        App.controllers.locationButton.getLatLngFromAddress(address);
      }
      else if(address.length ==0 ){
        App.views.map.clearLocation();
      }

      App.views.map.updateServicesWithFilter(searchData);
      App.views.serviceList.populateList(searchData);

      App.controllers.search.countChanged(searchData);
      $('#landing-page').modal('hide');

      }
    
    


  }

  initalize();

  return {
    setCount,
    countChanged,
    changeButtonState
  };
};
