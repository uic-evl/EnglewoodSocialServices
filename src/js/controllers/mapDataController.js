"use strict";

let MapDataController = function() {
  let self = {
    dataDropdownList: null,

    toggleButton: null,
    mapDataPanel: null,
    resetButton: null,
    censusResetButton: null,
    censusDropdownButton: null,
    censusDropdownList: null,
    data: null,

    filters: {}, // equivalent to subcategory states

    mainCategoryStates: {},
    mainStateToIcon: {
      "none": "glyphicon-unchecked",
      "some": "glyphicon-plus",
      "all": "glyphicon-check"
    }
  };

  function setDataDropdown(id) {
    self.dataDropdownList = d3.select(id);
  }

  function setCensusClearButton(){
    self.censusResetButton = d3.selectAll("#allCensusButton")
    .on('click', resetFilters);

    self.censusDropdownButton = d3.select("#censusDropdownButton");

    self.censusDropdownList = d3.select("#censusDropdownList");
  }

  function setupDataPanel(buttonID, listWrapperID) {
    self.mapDataPanel = d3.select(listWrapperID)
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("height", window.innerHeight - d3.select(".navbar").node().clientHeight + "px");

    self.toggleButton = d3.select(buttonID).classed("open", false)
    .on("click", function(d) {
      let open = !d3.select(this).classed("open");
      d3.select(this).classed("open", open);

      d3.select(this).select(".glyphicon").attr("class", open ? "glyphicon glyphicon-arrow-up" : "glyphicon glyphicon-arrow-down");

      self.mapDataPanel
      .style("pointer-events", open ? "all" : "none")
      .style("opacity", open ? 1 : 0);
    });
  }

  function attachResetOverlayButton(id) {
    self.resetButton = d3.select(id)
    .on("click", resetOverlay);
  }

  function resetOverlay() {
    self.mapDataPanel.selectAll(".mapButton").each(removeMap);
    App.views.map.drawChoropleth();
    console.log("Reset Overlay");
  }

  function resetFilters() {
    console.log("Reset Filters");

    self.filters = {};

    for (let mainCategory of Object.keys(self.mainCategoryStates)) {
      self.mainCategoryStates[mainCategory] = "none";
    }

    self.censusDropdownList.selectAll(".glyphicon")
    .attr("class", "glyphicon glyphicon-unchecked");

    self.censusDropdownButton.selectAll('#currentServiceSelection').text("Select Census Category...");
    self.censusDropdownButton.attr("class", "btn btn-default dropdown-toggle");

    self.censusResetButton.selectAll('#currentServiceSelection').text("Clear Selection");
    // self.censusResetButton.attr('disabled',true);
    document.getElementById("allCensusButton").style.display = "none";
  }

  function populateDropdown(categories) {
    console.log(categories);
    self.data = categories;
    let tier1Categories = Object.keys(categories);

    for (let category of tier1Categories) {
      self.mainCategoryStates[category] = "none"; // "some", "all"
    }

    self.censusDropdownList.selectAll(".mainType")
    .data(tier1Categories)
    .enter().append("li")
    .attr("class", "dropdown-submenu serviceType")
    .each(function(c1) {
      var title = c1;
      title = title.toLowerCase();
      title = title.replace(/_/g, ' ');

      let listItem = d3.select(this);
        // create link within tab
        listItem.append("a")
        .attr("tabindex", -1)
        .attr("id", "main_" + convertPropertyToID(c1))
        .html("<span class='glyphicon glyphicon-unchecked'></span>" + title)
          // .html(c1)
          .on((L.Browser.mobile ? "click" : "mouseover"), function(d) {
              // d3.event.stopPropagation();

              // self.filterDropdownList.selectAll(".serviceType").classed("open", false);
              // d3.select(this).node().parentNode.classList.toggle("open");
            });


        // create tab content div for this t1 category
        let secondaryDropdown = listItem.append("ul")
        .attr("class", "dropdown-menu")

        // secondaryDropdown.append("li")
        //   .attr("class", "serviceSubtype")
        //   .append("a")
        //   .datum(c1)
        //   .attr("id", "main_" + convertPropertyToID(c1))
        //   .html("<span class='glyphicon glyphicon-unchecked'></span>Select All")
        //   .on("click", function(c1) {
        //     // d3.event.stopPropagation(); // prevent menu close on link click
        //     self.filterDropdownList.selectAll(".serviceType").classed("open", false);

        //     //reset other filters to allow for only one main category selection at a time
        //     for (let mainCategory of Object.keys(self.mainCategoryStates)) {
        //       if (mainCategory !== c1) {
        //         self.mainCategoryStates[mainCategory] = "none";
        //       }
        //     }
        //     self.filterDropdownList.selectAll(".glyphicon")
        //       .attr("class", "glyphicon glyphicon-unchecked");
        //     self.filters = {};


        //     //update UI for main category selection
        //     let selected;
        //     if (self.mainCategoryStates[c1] === "all") {
        //       self.mainCategoryStates[c1] = "none";
        //       selected = false;
        //     } else {
        //       self.mainCategoryStates[c1] = "all";
        //       selected = true;
        //     }

        //     if (selected) {
        //       self.filterDropdownButton.selectAll('#currentServiceSelection').text(`${c1}`);
        //       self.filterDropdownButton.attr("class", "btn btn-success dropdown-toggle");

        //       self.allServicesButton.attr('disabled', null);
        //     } else {
        //       resetFilters();
        //     }

        //     updateMainCategoryIcon(c1);

        //     listItem.select("ul").selectAll(".serviceSubtype")
        //       .each(function(d) {
        //         self.filters[d] = selected;

        //         updateSubCategoryIcon(d);
        //       });

        //     filtersUpdated();
        //   });

        // secondaryDropdown.append("li").attr("class", "divider");

        console.log(categories[c1]);

        secondaryDropdown.selectAll(".secondaryCategory")
        .data(categories[c1])
        .enter().append("li")
        .attr("class", "secondaryCategory serviceSubtype")
        .append("a")
        .datum(function(c2) {
          return {
            mainType: c1,
            subType: c2,
            type: "census"
          };
        })
        .attr("id", d => "sub_" + convertPropertyToID(d.subType))
        .html(function(d) {
          return "<span class='glyphicon glyphicon-unchecked'></span>" + d.subType;
        })
        .on("click", function(d) {
            // d3.event.stopPropagation(); // prevent menu close on link click

            //reset other filters to allow for only one sub category selection at a time
            let isMainCategorySelection = Object.keys(self.filters).length > 1;
            for (let mainCategory of Object.keys(self.mainCategoryStates)) {
              if (mainCategory !== d.mainType) {
                self.mainCategoryStates[mainCategory] = "none";
              }
            }
            self.censusDropdownList.selectAll(".glyphicon")
            .attr("class", "glyphicon glyphicon-unchecked");
            listItem.select("ul").selectAll(".serviceSubtype")
            .each(function(subType) {
              if (subType !== d.subType) {
                self.filters[subType] = false;

                updateSubCategoryIcon(subType);
              }
            });
            let curSelection = self.filters[d.subType];
            self.filters = {};

            //select current subcategory if previous filters indicate a main category selection
            if (isMainCategorySelection) {
              self.filters[d.subType] = true;
            } else {
              // toggle whether or not it is selected
              self.filters[d.subType] = !curSelection;
            }

            if (self.filters[d.subType]) {
              var button = d3.select("#censusDropdownButton");

              button.selectAll('#currentServiceSelection').text(`${_.truncate(d.subType,{length: 30})}`);
              button.attr("class", "btn btn-success navbar-btn dropdown-toggle");

              document.getElementById("allCensusButton").style.display = "";

            } else {
              resetFilters();
            }


            updateSubCategoryIcon(d.subType);
            updateMainCategoryOnSubUpdate(d.mainType);

            chartButtonClick(d);
          });

      });


}

function convertPropertyToID(propertyName) {
  return propertyName.replace(/\W+/g, '_')
}

function mapButtonClick(d) {
    // d3.event.stopPropagation(); // prevent menu close on link click

    // toggle whether or not it is selected
    if (d3.select(this).classed("btn-danger")) {
      removeMap.call(this, d);
      App.views.map.drawChoropleth();
    } else {
      self.mapDataPanel.selectAll(".mapButton").each(removeMap);

      addMap.call(this, d);
      let reducedData = App.models.censusData.getSubsetGeoJSON(d);
      App.views.map.drawChoropleth(reducedData);
    }

    // let reducedData = App.models.censusData.getSubsetGeoJSON(d);
    // App.views.map.drawChoropleth(reducedData);
  }

  function addMap(d) {
    // update panel-heading
    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");

    let mapLabel = panelHeading.selectAll(".hasMap");
    mapLabel.style("display", "inline");
    d3.select(this).attr("class", "btn btn-danger mapButton");
  }

  function removeMap(d) {
    // update panel-heading
    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");

    let mapLabel = panelHeading.selectAll(".hasMap");
    mapLabel.style("display", "none");
    d3.select(this).attr("class", "btn btn-success mapButton");
  }

  function chartButtonClick(d) {
    console.log("Create chart for", d);
    // chart exists already
    // if (d3.select(this).classed("btn-danger")) {
    //   removeChart.call(this, d);
    //   App.views.chartList.removePropertyChart(d);
    // } else {
    //   addChart.call(this, d);
    //   App.views.chartList.addPropertyChart(d);
    // }

    App.views.chartList.addPropertyChart(d);
  }

  function addChart(d) {
    d3.select(this).attr("class", "btn btn-danger chartButton");

    // let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");
    // update chart Number

    let chartLabel = panelHeading.selectAll(".numCharts");
    let numCharts = +chartLabel.attr("data-count")+1;

    chartLabel.attr("data-count", numCharts)
    .text(numCharts + (numCharts === 1 ? " Chart" : " Charts"))
    .style("display", numCharts <= 0 ? "none": "inline");
  }

  function removeChart(d) {
    d3.select(this).attr("class", "btn btn-success chartButton");

    let panelHeading = d3.select(self.mapDataPanel.selectAll("#" + _.kebabCase("main_" + d.mainType)).node().parentNode).selectAll(".panel-heading");
    // update chart Number

    let chartLabel = panelHeading.selectAll(".numCharts");
    let numCharts = +chartLabel.attr("data-count") - 1;

    chartLabel.attr("data-count", numCharts)
    .text(numCharts + (numCharts === 1 ? " Chart" : " Charts"))
    .style("display", numCharts <= 0 ? "none" : "inline");
  }

  function removeChartFromList(propertyTypes) {
    d3.selectAll("#" + _.kebabCase("main_" + propertyTypes.mainType)).selectAll("#" + _.kebabCase("sub_" + propertyTypes.subType))
    .select(".chartButton")
    .each(removeChart);
  }

  function updateMainCategoryOnSubUpdate(category) {
    // console.log(self.data[category]);
    let subcategories = self.data[category];
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

    let item = self.censusDropdownList.selectAll(".serviceType>" + id);
    let selectAllButton = self.censusDropdownList.selectAll(".serviceSubtype>" + id);
    let state = self.mainCategoryStates[category];

    item.select(".glyphicon")
      .attr("class", "glyphicon " + self.mainStateToIcon[state]);

    if (state === "some") {
      selectAllButton.select(".glyphicon")
        .attr("class", "glyphicon glyphicon-unchecked");
    } else {
      selectAllButton.select(".glyphicon")
        .attr("class", "glyphicon " + self.mainStateToIcon[state]);
    }
  }

  function updateSubCategoryIcon(category) {
    let id = "#sub_" + convertPropertyToID(category);

    let item = self.censusDropdownList.selectAll(id);
    let state = self.filters[category];

    item.select(".glyphicon")
      .attr("class", "glyphicon " + (state ? "glyphicon-check" : "glyphicon-unchecked"));
  }


  return {
    setupDataPanel,
    attachResetOverlayButton,

    populateDropdown,
    removeChartFromList,
    setCensusClearButton
  };
}
