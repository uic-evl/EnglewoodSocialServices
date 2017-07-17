"use strict";

var App = App || {};

let documentPromise = new Promise(function(resolve, reject) {
  $(document).ready(function() {
    resolve();
  });
});

// make sure both the document and CSS are loaded
Promise.all([documentPromise, less.pageLoadFinished])
  .then(function() {
    App.init();
  })
  .catch(function(err) {
    console.log(err);
  });

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
    console.log("Loading Finder");
    App.views.map = new MapView("serviceMap");
    App.views.serviceList = new ServiceListView("#serviceList");
    App.views.serviceList.makeExpanding("#serviceListWrapper");

    App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList");
    App.controllers.serviceFilterDropdown.attachAllServicesButton("#allServicesButton");

    App.controllers.locationButton.attachLocationButton("#locationButton");
    App.controllers.locationButton.attachAddressLookupButton("#findAddressButton");

    App.controllers.search.attachDOMElements("#searchInput", "#searchCount", "#searchButton");

    let socialServiceP = App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
    let serviceTaxonomyP = App.models.serviceTaxonomy.loadData("./data/serviceTaxonomy.json");

    Promise.all([socialServiceP, serviceTaxonomyP])
      .then(function(values) {
        // App.views.map.createMap();

        App.views.map.plotServices(App.models.socialServices.getData());
        App.views.serviceList.populateList(App.models.socialServices.getData());

        App.controllers.search.setCount(App.models.socialServices.getData().length);

        App.controllers.serviceFilterDropdown.populateDropdown();
      })
      .catch(function(err) {
        console.log(err);
      });


  };

})();
