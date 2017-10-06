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
  App.models.landInventory = new LandInventoryModel();
  App.models.crimeData = new CrimeDataModel();

  // views


  // controllers
  App.controllers.serviceFilterDropdown = new FilterDropdownController();
  App.controllers.mapData = new MapDataController();
  // App.controllers.locationButton = new LocationButtonController();
  App.controllers.search = new SearchController();

  App.init = function () {
    $('[data-toggle="tooltip"]').tooltip(); //needed for button tooltips
    App.views.loadingMessage = new LoadingMessageView("#loading-indicator");
    
    console.log("Loading Analytics");
    App.views.loadingMessage.startLoading("Loading Map");
    App.views.map = new MapView("serviceMap");
    App.views.map.drawEnglewoodOutline();

    App.views.loadingMessage.updateAndRaise("Initializing buttons and interface elements");
    App.views.chartList = new ChartListView("#chartList");
    App.views.chartList.makeCollapsing("#toggleHideChartsButton", "#chartListWrapper");

    // App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList");
    App.controllers.serviceFilterDropdown.setFilterDropdown("#filterDropdownList", "#filterDropdownButton");
    App.controllers.serviceFilterDropdown.attachAllServicesButton("#allServicesButton");
    
    App.controllers.serviceMarkerView = new LeafletMarkerViewController("#toggleServiceView","#serviceViewText", "Service");
    App.controllers.landMarkerView = new LeafletMarkerViewController("#toggleLotView", "#lotViewText", "Vacant Lot");

    // App.controllers.mapData.setDataDropdown("#mapSettingsPanel");
    App.controllers.mapData.setupDataPanel("#mapPanelToggle", "#mapSettingsPanel");
    // App.controllers.mapData.setPanelToggle("#mapPanelToggle");
    App.controllers.mapData.attachResetOverlayButton("#resetMaps");

    // App.controllers.locationButton.attachLocationButton("#locationButton");
    // App.controllers.locationButton.attachAddressLookupButton("#findAddressButton");

    App.controllers.search.attachDOMElements("#searchInput", "#searchButton");

    // App.controllers.rectSelector = new RectSelectorController("#newRectSelector");
    // App.controllers.rectSelector.attachDragLayer("#serviceMap");
    // App.controllers.rectSelector.attachSpecificSelector("#rectSelector1", "1");
    // App.controllers.rectSelector.attachSpecificSelector("#rectSelector2", "2");

    App.views.loadingMessage.updateAndRaise("Loading location, service, and census data");
    let numFinished = 0;
    let socialServiceP = App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
      .then((data) => {
        console.log("Loaded Social Services", ++numFinished);
        return data;
      });
    let serviceTaxonomyP = App.models.serviceTaxonomy.loadData("./data/serviceTaxonomy.json")
      .then((data) => {
        console.log("Loaded Service Taxonomy", ++numFinished);
        return data;
      });
    let boundaryDataP = App.models.boundaryData.loadData()
      .then((data) => {
        console.log("Loaded Boundary Data", ++numFinished);
        return data;
      });
    let censusDataP = App.models.censusData.loadData()
      .then(function (data) {
        let overlayData = data[0];
        let overlayCategories = data[1];

        App.controllers.mapData.populateDropdown(overlayCategories, max_subdropdown_height);

        console.log("Loaded Census Data", ++numFinished);
        return data;
      });
    let landInventoryP = App.models.landInventory.loadData()
      .then((data) => {
        console.log("Loaded Land Inventory Data", ++numFinished);
        return data;
      });
    // let crimeDataP = App.models.crimeData.loadData()
    //   .then((data) => {
    //     console.log("Loaded Crime Data");
    //     return data;
    //   });

    App.controllers.mapData.setCensusClearButton();

    // load other data sources when asked to plot
    let max_subdropdown_height = d3.select('body').node().clientHeight * 0.4;

    console.time("load data");
    Promise.all([socialServiceP, serviceTaxonomyP, boundaryDataP, censusDataP, landInventoryP, /*crimeDataP*/])
      .then(function(values) {
        // App.views.map.createMap();
        console.timeEnd("load data");

        console.time("plotting data");
        App.views.loadingMessage.updateAndRaise("Plotting services and lots");
        App.views.map.plotServices(App.models.socialServices.getData());
        App.views.map.plotLandInventory(App.models.landInventory.getDataByFilter());

        // App.views.chartList...
        console.timeEnd("plotting data");
        console.time("Adding lot chart");
        App.views.chartList.addLotChart();
        console.timeEnd("Adding lot chart");

        console.time("populating dropdown");
        App.controllers.serviceFilterDropdown.populateDropdown(max_subdropdown_height);
        console.timeEnd("populating dropdown");

        //start off with markers hidden
        console.time("setting marker visibility");
        App.controllers.serviceMarkerView.setVisibilityState(false); 
        App.controllers.landMarkerView.setVisibilityState(false); 
        console.timeEnd("setting marker visibility");

        //set two selections to be west englewood and englewood
        console.time("getting selection data");
        App.views.loadingMessage.updateAndRaise("Filtering data for West Englewood and Englewood");
        let westEnglewoodPoly = App.models.boundaryData.getWestEnglewoodPolygon();
        let englewoodPoly = App.models.boundaryData.getEnglewoodPolygon();
        let selectionData = {
          westEnglewood: {
            data: {
              census: App.models.censusData.getDataWithinPolygon(westEnglewoodPoly).dataTotals,
              // service: App.models.socialServices.getDataByFilter((service) => {
              //   let point = [parseFloat(service.X), parseFloat(service.Y)];
              //   return App.models.boundaryData.isInWestEnglewood(point);
              // }),
              lot: App.models.landInventory.getDataByFilter((a) => { return a.Area === "West Englewood"; })
            },
            area: turf.area(westEnglewoodPoly),
            color: "#1f77b4",
            id: "West Englewood",
            bounds: (function(poly){
              console.time("bounds get");
              let coordsArr = poly.geometry.coordinates[0];
              let latExtent = d3.extent(coordsArr, (d) => { return d[1]; });
              let lngExtent = d3.extent(coordsArr, (d) => { return d[0]; });

              console.timeEnd("bounds get");

              return [
                [latExtent[0], lngExtent[0]],
                [latExtent[1], lngExtent[1]],
              ];
            })(westEnglewoodPoly)
          },
          englewood: {
            data: {
              census: App.models.censusData.getDataWithinPolygon(englewoodPoly).dataTotals,
              // service: App.models.socialServices.getDataByFilter((service) => {
              //   let point = [parseFloat(service.X), parseFloat(service.Y)];
              //   return App.models.boundaryData.isInEnglewood(point);
              // }),
              lot: App.models.landInventory.getDataByFilter((a) => { return a.Area === "Englewood"; })
            },
            area: turf.area(englewoodPoly),
            color: "#ff7f0e",
            id: "Englewood",
            bounds: (function (poly) {
              console.time("bounds get");
              let coordsArr = poly.geometry.coordinates[0];
              let latExtent = d3.extent(coordsArr, (d) => { return d[1]; });
              let lngExtent = d3.extent(coordsArr, (d) => { return d[0]; });

              console.timeEnd("bounds get");
              return [
                [latExtent[0], lngExtent[0]],
                [latExtent[1], lngExtent[1]],
              ];
            })(englewoodPoly)
          }
        };

        console.timeEnd("getting selection data");
        console.log(selectionData);

        App.views.chartList.addSelection(selectionData.westEnglewood);
        App.views.chartList.addSelection(selectionData.englewood);

        App.views.loadingMessage.finishLoading();
      })
      .catch(function(err) {
        console.log(err);
      });
  };

})();
