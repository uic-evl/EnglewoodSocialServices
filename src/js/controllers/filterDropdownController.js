"use strict";

var App = App || {};

let FilterDropdownController = function() {
  let self = {
    filterDropdownList: null,
    allServicesButton: null,

    filters: {}
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
    self.filterDropdownList.selectAll(".glyphicon")
      .classed("glyphicon-hidden", true);
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
          .html("<span class='glyphicon glyphicon-minus glyphicon-hidden'></span>  " + c1)
          .on("click", function(c1) {
            d3.event.stopPropagation(); // prevent menu close on label click
            let check = d3.select(this).select(".glyphicon");

            let selected = check.classed("glyphicon-hidden");
            check.classed("glyphicon-hidden", !selected);

            listItem.select("ul").selectAll(".serviceSubtype")
              .each(function(d) {
                let check = d3.select(this).select(".glyphicon");

                check.classed("glyphicon-hidden", !selected);

                console.log(d);
                self.filters[d] = selected;
              });


          });

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
          .html(function(d) {
            return "<span class='glyphicon glyphicon-ok glyphicon-hidden'></span>  " + d.subType;
          })
          .on("click", function(d) {
            d3.event.stopPropagation(); // prevent menu close on label click
            let check = d3.select(this).select(".glyphicon");

            let selected = !check.classed("glyphicon-hidden");
            check.classed("glyphicon-hidden", selected);

            self.filters[d.subType] = selected;

            console.log(d);
          });

      });

  }

  function convertPropertyToID(propertyName) {
    return propertyName.replace(/\W+/g, '_')
  }

  return {
    setFilterDropdown,
    attachAllServicesButton,

    populateDropdown
  };
};
