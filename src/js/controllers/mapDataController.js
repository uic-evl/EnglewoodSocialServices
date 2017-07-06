"use strict";

let MapDataController = function() {
  let self = {
    dataDropdownList: null,
    resetButton: null,
  };

  function setDataDropdown(id) {
    self.dataDropdownList = d3.select(id);
  }

  function attachResetOverlayButton(id) {
    self.resetButton = d3.select(id)
      .on("click", resetOverlay);
  }

  function resetOverlay() {
    console.log("Reset Overlay");
  }

  function populateDropdown(categories) {
    console.log(categories);


    self.dataDropdownList.selectAll(".censusType")
      .data(Object.keys(categories))
    .enter().append("li")
      .attr("class", "dropdown-submenu censusType")
      .each(function(c1) {
        let listItem = d3.select(this);

        // create link within tab
        listItem.append("a")
          .attr("tabindex", -1)
          .attr("href", "#")
          .attr("id", _.kebabCase("main_" + c1))
          .html(_.capitalize(_.startCase(c1)));

        // create tab content div for this t1 category
        let secondaryDropdown = listItem.append("ul")
          .attr("class", "dropdown-menu")

        secondaryDropdown.selectAll(".censusSubtype")
          .data(categories[c1])
        .enter().append("li")
          .attr("class", "censusSubtype")
        .append("a")
          .datum(function(c2) {
            return {
              mainType: c1,
              subType: c2
            };
          })
          .attr("id", d => _.kebabCase("sub_" + d.subType))
          .html(function(d) {
            return "<span class='glyphicon glyphicon-unchecked'></span>" + d.subType;
          })
          .on("click", function(d) {
            d3.event.stopPropagation(); // prevent menu close on link click

            // toggle whether or not it is selected
            console.log(d);


          });

      });
  }

  return {
    setDataDropdown,
    attachResetOverlayButton,

    populateDropdown
  }
}
