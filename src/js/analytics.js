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
    setTimeout(function() {
      App.init();
    }, 0);
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
  App.models.censusData = new CensusDataModel();

  // views


  // controllers
  App.controllers.serviceFilterDropdown = new FilterDropdownController();
  App.controllers.mapData = new MapDataController();
  // App.controllers.locationButton = new LocationButtonController();
  App.controllers.search = new SearchController();

  App.init = function() {
    console.log("Loading Analytics");
    App.views.map = new MapView("serviceMap");
    App.views.chartList = new ChartListView("#chartList");
    App.views.chartList.makeCollapsing("#toggleHideChartsButton", "#chartListWrapper");

    // App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList");
    App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList", "#filterDropdownButton");
    App.controllers.serviceFilterDropdown.attachAllServicesButton("#allServicesButton");

    // App.controllers.mapData.setDataDropdown("#mapSettingsPanel");
    App.controllers.mapData.setupDataPanel("#mapPanelToggle", "#mapSettingsPanel");
    // App.controllers.mapData.setPanelToggle("#mapPanelToggle");
    App.controllers.mapData.attachResetOverlayButton("#resetMaps");

    // App.controllers.locationButton.attachLocationButton("#locationButton");
    // App.controllers.locationButton.attachAddressLookupButton("#findAddressButton");

    App.controllers.search.attachDOMElements("#searchInput", "#searchButton");

    App.controllers.rectSelector = new RectSelectorController("#newRectSelector");
    App.controllers.rectSelector.attachDragLayer("#serviceMap");
    App.controllers.rectSelector.attachSpecificSelector("#rectSelector1", "1");
    App.controllers.rectSelector.attachSpecificSelector("#rectSelector2", "2");

    let socialServiceP = App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
    let serviceTaxonomyP = App.models.serviceTaxonomy.loadData("./data/serviceTaxonomy.json");

    // load other data sources when asked to plot

    Promise.all([socialServiceP, serviceTaxonomyP])
      .then(function(values) {
        // App.views.map.createMap();

        App.views.map.plotServices(App.models.socialServices.getData());

        // App.views.chartList...

        App.controllers.serviceFilterDropdown.populateDropdown();
      })
      .catch(function(err) {
        console.log(err);
      });

    App.models.censusData.loadData()
      .then(function(data) {
        let overlayData = data[0];
        let overlayCategories = data[1];

        App.controllers.mapData.populateDropdown(overlayCategories);
      });

  };

})();
