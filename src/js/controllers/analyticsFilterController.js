"use strict";

var App = App || {};

let FilterDropdownController = function() {
  let self = {
    filterDropdownList: null,
    allServicesButton: null,

    filters: {}, // equivalent to subcategory states

    mainCategoryStates: {},
    mainStateToIcon: {
      "none": "glyphicon-unchecked",
      "some": "glyphicon-plus",
      "all": "glyphicon-ok"
    }
  };

  init();

  function init() {}

  function attachAllServicesButton(id) {
    self.allServicesButton = d3.select(id)
      .on('click', resetFilters)
  }

  function resetFilters() {
    console.log("Reset Filters");

    self.filters = {}

    for (let mainCategory of Object.keys(self.mainCategoryStates)) {
      self.mainCategoryStates[mainCategory] = "none";
    }

    self.filterDropdownList.selectAll(".glyphicon")
      .attr("class", "glyphicon glyphicon-unchecked");

    filtersUpdated();
  }

  function setFilterDropdown(id) {
    self.filterDropdownList = d3.select(id);
  }

  function populateDropdown() {
    let tier1Categories = App.models.serviceTaxonomy.getTier1Categories();

    for (let category of tier1Categories) {
      self.mainCategoryStates[category] = "none"; // "some", "all"
    }

    self.filterDropdownList.selectAll(".mainType")
      .data(tier1Categories)
    .enter().append("li")
      .attr("class", "dropdown-submenu serviceType")
      .each(function(c1) {
        let listItem = d3.select(this);
        let tier2Categories = App.models.serviceTaxonomy.getTier2CategoriesOf(c1);

        // create link within tab
        listItem.append("a")
          .attr("tabindex", -1)
          .attr("href", "#")
          .attr("id", "main_" + convertPropertyToID(c1))
          .html("<span class='glyphicon glyphicon-unchecked'></span>" + c1)
          .on("click", function(c1) {
            d3.event.stopPropagation(); // prevent menu close on link click

            let selected;

            if (self.mainCategoryStates[c1] === "all") {
              self.mainCategoryStates[c1] = "none";
              selected = false;
            } else {
              self.mainCategoryStates[c1] = "all";
              selected = true;
            }

            updateMainCategoryIcon(c1);

            listItem.select("ul").selectAll(".serviceSubtype")
              .each(function(d) {
                self.filters[d] = selected;

                updateSubCategoryIcon(d);
              });

            filtersUpdated();
          });

        // create tab content div for this t1 category
        let secondaryDropdown = listItem.append("ul")
          .attr("class", "dropdown-menu")

        secondaryDropdown.selectAll(".serviceSubtype")
          .data(tier2Categories)
        .enter().append("li")
          .attr("class", "serviceSubtype")
        .append("a")
          .datum(function(c2) {
            return {
              mainType: c1,
              subType: c2
            };
          })
          .attr("id", d => "sub_" + convertPropertyToID(d.subType))
          .html(function(d) {
            return "<span class='glyphicon glyphicon-unchecked'></span>" + d.subType;
          })
          .on("click", function(d) {
            d3.event.stopPropagation(); // prevent menu close on link click

            // toggle whether or not it is selected
            self.filters[d.subType] = !self.filters[d.subType];

            updateSubCategoryIcon(d.subType);
            updateMainCategoryOnSubUpdate(d.mainType);

            filtersUpdated();
          });

      });
  }

  function convertPropertyToID(propertyName) {
    return propertyName.replace(/\W+/g, '_')
  }

  function updateMainCategoryOnSubUpdate(category) {
    let subcategories = App.models.serviceTaxonomy.getTier2CategoriesOf(category);
    let hasChecked = false;
    let hasUnchecked = false;

    for (let subC of subcategories) {
      if (self.filters[subC]) {
        hasChecked = true;
      } else {
        hasUnchecked = true;
      }
    }

    if (hasChecked && hasUnchecked) {
      self.mainCategoryStates[category] = "some";
    } else if (hasChecked) {
      self.mainCategoryStates[category] = "all";
    } else {
      self.mainCategoryStates[category] = "none";
    }

    updateMainCategoryIcon(category);
  }

  function updateMainCategoryIcon(category) {
    let id = "#main_" + convertPropertyToID(category);

    let item = self.filterDropdownList.select(id);
    let state = self.mainCategoryStates[category];

    item.select(".glyphicon")
      .attr("class", "glyphicon " + self.mainStateToIcon[state]);
  }

  function updateSubCategoryIcon(category) {
    let id = "#sub_" + convertPropertyToID(category);

    let item = self.filterDropdownList.select(id);
    let state = self.filters[category];

    item.select(".glyphicon")
        .attr("class", "glyphicon " + (state ? "glyphicon-ok" : "glyphicon-unchecked"));
  }

  function filtersUpdated() {
    let filtersToSend = {};

    for (let subcategory of Object.keys(self.filters)) {
      if (self.filters[subcategory]) {
        filtersToSend[subcategory] = true;
      }
    }

    App.views.map.updateServicesWithFilter(filtersToSend);
  }

  return {
    setFilterDropdown,
    attachAllServicesButton,

    populateDropdown
  };
};
