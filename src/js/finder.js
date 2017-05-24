"use strict";

var App = App || {};

(function() {
  App.models = {};
  App.views = {};
  App.controllers = {};

  App.models.socialServices = new SocialServiceModel();
  App.models.serviceTaxonomy = new ServiceTaxonomyModel();

  App.controllers.serviceTypeTabs = new TabController();

  App.init = function() {
    console.log("Loading Finder");

    App.views.map = new MapView("serviceMap");
    App.views.serviceList = new ServiceListView("#serviceList")

    App.controllers.serviceTypeTabs.setTabList("#serviceTabList");
    App.controllers.serviceTypeTabs.setTabContentDiv("#serviceTabContentDiv");
    App.controllers.serviceTypeTabs.attachAllServicesLink("#allServicesLink");

    let socialServiceP = App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
    let serviceTaxonomyP = App.models.serviceTaxonomy.loadData("./data/serviceTaxonomy.json");

    Promise.all([socialServiceP, serviceTaxonomyP])
      .then(function(values) {
        App.views.map.plotServices(App.models.socialServices.getData());
        App.views.serviceList.populateList(App.models.socialServices.getData());

        // App.controllers.serviceTypeTabs.populateTabs();


        console.log(App.models.serviceTaxonomy.getTier1Categories());
        console.log(App.models.serviceTaxonomy.getAllTier2Categories());
        console.log(App.models.serviceTaxonomy.getTier2CategoriesOf("Basic Needs"));
      })
      .catch(function(err) {
        console.log(err);
      });


  };

})();
