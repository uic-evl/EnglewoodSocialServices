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

(function() {
  App.models = {};
  App.views = {};
  App.controllers = {};

  // models
  App.models.socialServices = new SocialServiceModel();
  App.models.serviceTaxonomy = new ServiceTaxonomyModel();
  App.models.censusData = new CensusDataModel();
  App.models.boundaryData = new BoundaryDataModel();

  // views


  // controllers
  App.controllers.serviceFilterDropdown = new FilterDropdownController();
  App.controllers.mapData = new MapDataController();
  // App.controllers.locationButton = new LocationButtonController();
  App.controllers.search = new SearchController();

  App.init = function () {
    $('[data-toggle="tooltip"]').tooltip(); //needed for button tooltips
    console.log("Loading Analytics");
    App.views.map = new MapView("serviceMap");
    App.views.map.drawEnglewoodOutline();
    App.views.chartList = new ChartListView("#chartList");
    App.views.chartList.makeCollapsing("#toggleHideChartsButton", "#chartListWrapper");

    // App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList");
    App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList", "#filterDropdownButton");
    App.controllers.serviceFilterDropdown.attachAllServicesButton("#allServicesButton");
    
    App.controllers.serviceMarkerView = new ServiceMarkerViewController("#toggleServiceView");

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
    let boundaryDataP = App.models.boundaryData.loadData();

    App.controllers.mapData.setCensusClearButton();

    // load other data sources when asked to plot
    let max_subdropdown_height = d3.select('body').node().clientHeight * 0.4;

    Promise.all([socialServiceP, serviceTaxonomyP, boundaryDataP])
      .then(function(values) {
        // App.views.map.createMap();

        App.views.map.plotServices(App.models.socialServices.getData());

        // App.views.chartList...

        App.controllers.serviceFilterDropdown.populateDropdown(max_subdropdown_height);

        App.controllers.serviceMarkerView.setVisibilityState(false); //start off with markers hidden
      })
      .catch(function(err) {
        console.log(err);
      });

    App.models.censusData.loadData()
      .then(function(data) {
        let overlayData = data[0];
        let overlayCategories = data[1];

        App.controllers.mapData.populateDropdown(overlayCategories,max_subdropdown_height);
      });

  };

})();
