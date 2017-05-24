"use strict";

var App = App || {};

let TabController = function() {
  let self = {
    tabList: null,
    tabContentDiv: null,
    allServicesLink: null
  };

  init();

  function init() {

  }

  function attachAllServicesLink(id) {
    self.allServicesLink = d3.select(id)
      .on('click', resetFilters)
  }

  function resetFilters() {
    console.log("Reset Filters");
  }

  function setTabList(id) {
    self.tabList = d3.select(id);
  }

  function setTabContentDiv(id) {
    self.tabContentDiv = d3.select(id);
  }

  function populateTabs() {
    let tier1Categories = App.models.serviceTaxonomy.getTier1Categories();

    // tab format
    // <li><a data-toggle="tab" href="#type1">Type 1</a></li>

    // tab-content format
    /*
    <div id="type1" class="tab-pane fade">
        <div class="subtypeWrapper">
            ...
            subtypes
            ...
        </div>
    </div>
    */

    // subtype format
    // <button type="button" class="btn btn-info serviceSubtype" data-toggle="button">Type 1.1</button>

    self.tabList.selectAll(".typeTab")
      .data(tier1Categories)
    .enter().append("li")
      .attr("class", "typeTab")
      .each(function(d) {
        let tab = d3.select(this);
        let typeID = d.replace(/\W+/g, "_");

        // create link within tab
        tab.append("a")
          .attr("data-toggle", "tab")
          .attr("href", "#" + typeID)
          .text(d);

        let tier2Categories = App.models.serviceTaxonomy.getTier2CategoriesOf(d);

        // create tab content div for this t1 category
        let secondaryCategoryDiv = self.tabContentDiv.append("div")
          .attr("id", typeID)
          .attr("class", "tab-pane fade")
        .append("div")
          .attr("class", "subtypeWrapper");

        secondaryCategoryDiv.selectAll(".serviceSubtype")
          .data(tier2Categories)
        .enter().append("button")
          .attr("type", "button")
          .attr("class", "btn btn-info serviceSubtype")
          .attr("data-toggle", "button")
          .text(function(secondaryCategory) {
            return secondaryCategory;
          })
          .on("click", function(d) {
            let selected = !d3.select(this).classed("active");
            d3.select(this)

            console.log(d, selected);
          });

      });

  }

  return {
    setTabList,
    setTabContentDiv,

    attachAllServicesLink,

    populateTabs
  };
};
