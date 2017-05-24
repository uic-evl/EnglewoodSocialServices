"use strict";

var App = App || {};

let FilterDropdownController = function() {
  let self = {
    filterDropdownList: null,
    allServicesButton: null
  };

  init();

  function init() {

  }

  function attachAllServicesButton(id) {
    self.allServicesButton = d3.select(id)
      .on('click', resetFilters)
  }

  function resetFilters() {
    console.log("Reset Filters");
  }

  function setFilterDropdown(id) {
    self.filterDropdownList = d3.select(id);
  }

  function populateDropdown() {
    let tier1Categories = App.models.serviceTaxonomy.getTier1Categories();

    self.filterDropdownList.selectAll(".mainType")
      .data(tier1Categories)
    .enter().append("li")
      .attr("class", "dropdown-submenu serviceType")
      .each(function(c1) {
        let listItem = d3.select(this);

        // create link within tab
        listItem.append("a")
          .attr("tabindex", -1)
          .attr("href", "#")
          .text(c1);

        let tier2Categories = App.models.serviceTaxonomy.getTier2CategoriesOf(c1);

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
          .text(function(d) {
            return d.subType;
          })
          .on("click", function(d) {
            console.log(d);
          });

      });

  }

  return {
    setFilterDropdown,
    attachAllServicesButton,

    populateDropdown
  };
};
