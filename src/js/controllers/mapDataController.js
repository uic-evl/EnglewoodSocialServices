"use strict";

let MapDataController = function () {
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

  function setCensusClearButton() {
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
      .on("click", function (d) {
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

    let current_census_properties = {
      type: "census"
    };

    current_census_properties.subType = (Object.keys(self.filters).length === 1) ? Object.keys(self.filters)[0].split("||")[1] : "All";
    
    self.filters = {};

    console.log(self.mainCategoryStates)
    for (let mainCategory of Object.keys(self.mainCategoryStates)) {
      if (self.mainCategoryStates[mainCategory] !== "none") {
        current_census_properties.mainType = mainCategory;
      }
      self.mainCategoryStates[mainCategory] = "none";
    }

    console.log("current_census_properties", current_census_properties);
    console.trace();
    if(current_census_properties.mainType)
      App.views.chartList.removePropertyChart(current_census_properties);

    removeMap();

    self.censusDropdownList.selectAll(".glyphicon")
      .attr("class", "glyphicon glyphicon-unchecked");

    self.censusDropdownButton.selectAll('#currentServiceSelection').text("Select Census Category...");
    self.censusDropdownButton.attr("class", "btn btn-default dropdown-toggle");

    self.censusResetButton.selectAll('#currentServiceSelection').text("Clear Selection");
    // self.censusResetButton.attr('disabled',true);
    document.getElementById("allCensusButton").style.display = "none";
  }

  function getFilterKey(mainType,subType){
    return `${mainType}||${subType}`; //remove any non-alpha numberic characters except underscores
  }

  function populateDropdown(categories) {
    self.data = categories;
    let tier1Categories = Object.keys(categories);

    for (let category of tier1Categories) {
      self.mainCategoryStates[category] = "none"; // "some", "all"
    }

    self.censusDropdownList.selectAll(".mainType")
      .data(tier1Categories)
      .enter().append("li")
      .attr("class", "dropdown-submenu serviceType")
      .each(function (c1) {
        var title = c1;
        title = title.toLowerCase();
        title = title.replace(/_/g, ' ');

        let listItem = d3.select(this);
        // create link within tab
        listItem.append("a")
          .attr("tabindex", -1)
          .attr("id", "main_" + convertPropertyToID(c1))
          .html("<span class='glyphicon glyphicon-unchecked'></span>" + title);


        // create tab content div for this t1 category
        let secondaryDropdown = listItem.append("ul")
          .attr("class", "dropdown-menu");

        secondaryDropdown.selectAll(".secondaryCategory")
          .data(categories[c1])
          .enter().append("li")
          .attr("class", "secondaryCategory serviceSubtype")
          .append("a")
          .datum(function (c2) {
            return {
              mainType: c1,
              subType: c2,
              type: "census"
            };
          })
          .attr("id", d => "sub_" + convertPropertyToID(d.subType))
          .html(function (d) {
            return "<span class='glyphicon glyphicon-unchecked'></span>" + d.subType;
          })
          .on("click", function (d) {
            //reset other filters to allow for only one sub category selection at a time
            let isMainCategorySelection = Object.keys(self.filters).length > 1;
            for (let mainCategory of Object.keys(self.mainCategoryStates)) {
              if (mainCategory !== d.mainType) {
                self.mainCategoryStates[mainCategory] = "none";
              }
            }
            let filterKey = getFilterKey(d.mainType,d.subType);

            self.censusDropdownList.selectAll(".glyphicon")
              .attr("class", "glyphicon glyphicon-unchecked");
            listItem.select("ul").selectAll(".serviceSubtype")
              .each(function (subType) {
                let curKey = getFilterKey(d.mainType,subType);
                if (curKey !== filterKey) {
                  self.filters[curKey] = false;

                  updateSubCategoryIcon(d.mainType, subType);
                }
              });
            let curSelection = self.filters[filterKey];
            self.filters = {};

            //select current subcategory if previous filters indicate a main category selection
            if (isMainCategorySelection) {
              self.filters[filterKey] = true;
            } else {
              // toggle whether or not it is selected
              self.filters[filterKey] = !curSelection;
            }

            if (self.filters[filterKey]) {
              var button = d3.select("#censusDropdownButton");

              button.selectAll('#currentServiceSelection').text(`${_.truncate(d.subType,{length: 30})}`);
              button.attr("class", "btn btn-success navbar-btn dropdown-toggle");

              document.getElementById("allCensusButton").style.display = "";

              addMap(d);
            } else {
              resetFilters();
            }


            updateSubCategoryIcon(d.mainType, d.subType);
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
      // removeMap.call(this, d);
      App.views.map.drawChoropleth();
    } else {
      self.mapDataPanel.selectAll(".mapButton").each(removeMap);

      // addMap.call(this, d);
      let reducedData = App.models.censusData.getSubsetGeoJSON(d);
      App.views.map.drawChoropleth(reducedData);
    }

    // let reducedData = App.models.censusData.getSubsetGeoJSON(d);
    // App.views.map.drawChoropleth(reducedData);
  }

  function addMap(d) {
    let reducedData = App.models.censusData.getSubsetGeoJSON(d);
    App.views.map.drawChoropleth(reducedData);
  }

  function removeMap() {
    App.views.map.drawChoropleth();
  }

  function chartButtonClick(d) {
    console.log("Create chart for", d);
    App.views.chartList.addPropertyChart(d);
  }

  function addChart(d) {

    let chartLabel = panelHeading.selectAll(".numCharts");
    let numCharts = +chartLabel.attr("data-count") + 1;

    chartLabel.attr("data-count", numCharts)
      .text(numCharts + (numCharts === 1 ? " Chart" : " Charts"))
      .style("display", numCharts <= 0 ? "none" : "inline");
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
      let filterKey = getFilterKey(category,subC);
      if (self.filters[filterKey]) {
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

  function updateSubCategoryIcon(mainCategory,subCategory) {
    let id = "#sub_" + convertPropertyToID(subCategory);
    let main_id = "#main_" + convertPropertyToID(mainCategory);

    let item = d3.select(self.censusDropdownList.selectAll(main_id).node().parentNode).selectAll(id);
    let state = self.filters[getFilterKey(mainCategory,subCategory)];

    console.log(...arguments,main_id,id,state);

    item.select(".glyphicon")
      .attr("class", "glyphicon " + (state ? "glyphicon-check" : "glyphicon-unchecked"));
  }


  return {
    setupDataPanel,
    attachResetOverlayButton,
    resetFilters,
    populateDropdown,
    removeChartFromList,
    setCensusClearButton
  };
}