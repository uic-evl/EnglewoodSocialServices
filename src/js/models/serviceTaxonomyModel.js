"use strict";

var App = App || {};

let ServiceTaxonomyModel = function() {
  let self = {
    data: null,
    categoryCodeMap: {}
  };

  init();

  function init() {

  }

  function loadData(dataPath) {
    return App.controllers.dataDownload.getJson(dataPath)
      .then(function (data) {
        self.data = data;

        for (const code of Object.keys(self.data)) {
          self.categoryCodeMap[self.data[code].description] = code;
        }
        console.log(self.data);
        return;
      });
  }

  function getTier1Categories() {
    return Object.keys(self.data).map(k => self.data[k].description);
  }

  function getTier1CategoriesOf(tier2CategoryList) {
    return _.map(
      _.uniq(
        _.map(tier2CategoryList,
          t2 => _.findKey(self.data, t1 => _.includes(t1.children, t2))
        )
      ),
      code => self.data[code].description);
  }

  function getAllTier2Categories() {
    return _.flatten(Object.keys(self.data).map(k => self.data[k].children));
  }

  function getTier2CategoriesOf(tier1Category) {
    return self.data[self.categoryCodeMap[tier1Category]].children;
  }

  function getData() {
    return self.data;
  }

  return {
    loadData,
    getTier1Categories,
    getTier1CategoriesOf,
    getAllTier2Categories,
    getTier2CategoriesOf,
    getData
  };
};
