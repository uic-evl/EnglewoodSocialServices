"use strict";

var App = App || {};

let documentPromise = new Promise(function(resolve, reject) {
  $(document).ready(function() {
    console.log("$(document).ready done");
    resolve();
  });
});

let windowPromise = new Promise(function(resolve, reject) {
  $(window).on("load", function() {
    console.log("$(window).on('load') done");
    resolve();
  });
});

// make sure both the document and CSS are loaded
Promise.all([documentPromise, windowPromise, less.pageLoadFinished])
  .then(function() {
    setTimeout(function() {
      App.init();
    }, 500);
  })
  .catch(function(err) {
    console.log(err);
  });

window.onresize = function() {
  for (let view of Object.values(App.views)) {
    if (view.resize) {
      view.resize();
    }
  }
};

(function() {
  App.models = {};
  App.views = {};
  App.controllers = {};

  // models
  App.models.socialServices = new SocialServiceModel();
  App.models.serviceTaxonomy = new ServiceTaxonomyModel();

  // views


  // controllers
  App.controllers.serviceFilterDropdown = new FilterDropdownController();
  App.controllers.listToMapLink = new ListToMapLinkingController();
  App.controllers.locationButton = new LocationButtonController();
  App.controllers.search = new SearchController();

  App.init = function() {
    $('[data-toggle="popover"]').popover(); //needed for tooltip on landing page

    console.log("Loading Finder");
    App.views.map = new MapView("serviceMap");
    App.views.serviceList = new ServiceListView("#serviceList");
    App.views.serviceList.makeCollapsing("#toggleHideServicesButton", "#serviceListWrapper");

    App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList", "#filterDropdownButton");
    App.controllers.serviceFilterDropdown.attachAllServicesButton("#allServicesButton");

    App.controllers.locationButton.attachLocationButton("#locationButton");
    App.controllers.locationButton.attachAddressLookupButton("#findAddressButton");
    App.controllers.locationButton.attachSearchInput();

    App.controllers.search.attachDOMElements("#searchInput", "#searchCount", "#searchButton");

    let socialServiceP = App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
    let serviceTaxonomyP = App.models.serviceTaxonomy.loadData("./data/serviceTaxonomy.json");

    App.controllers.modal = new modalController();

    Promise.all([socialServiceP, serviceTaxonomyP])
      .then(function(values) {
        // App.views.map.createMap();

        App.views.map.plotServices(App.models.socialServices.getData());
        App.views.serviceList.populateList(App.models.socialServices.getData());

        App.controllers.search.setCount(App.models.socialServices.getData().length);
        App.controllers.modal.setCount(App.models.socialServices.getData().length);

        App.controllers.serviceFilterDropdown.populateDropdown(d3.select('body').node().clientHeight*0.4);
      })
      .catch(function(err) {
        console.log(err);
      });


  };

})();
