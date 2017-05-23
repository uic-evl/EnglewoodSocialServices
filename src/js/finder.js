"use strict";

var App = App || {};

(function() {
  App.models = {};
  App.views = {};
  App.controllers = {};

  App.models.socialServices = new SocialServiceModel();

  App.init = function() {
    console.log("Loading Finder");

    App.views.map = new MapView("serviceMap");

    App.models.socialServices.loadData("./data/EnglewoodLocations.csv")
      .then(function() {
        console.log(App.models.socialServices.getData());

      })
      .catch(function(err) {
        console.log(err);
      });


  };

})();
