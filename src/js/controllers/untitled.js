// populate census data dropdown
    self.mapDataPanel.select("#mapSettings").selectAll(".censusType")
      .data(Object.keys(categories))
      .enter().append("div")
      .attr("class", "panel panel-default censusType")
      .each(function(c1) {
        let panel = d3.select(this);

        // create link within tab
        let panelHeading = panel.append("div")
          .attr("class", "panel-heading")
          .attr("data-toggle", "collapse")
          .attr("href", "#" + _.kebabCase("main_" + c1));

        let title = panelHeading.append("span")
          .attr("class", "panelTitle")
          .text(_.capitalize(_.startCase(c1)));

        let numCharts = panelHeading.append("span")
          .attr("class", "label label-success numCharts")
          .attr("data-count", 0)
          .style("display", "none")
          .text("0 Charts");

        let hasMap = panelHeading.append("span")
          .attr("class", "label label-success hasMap")
          .style("display", "none")
          .text("Map");

        // create tab content div for this t1 category
        let panelBody = panel.append("div")
          .attr("class", "panel-collapse collapse")
          .attr("id", _.kebabCase("main_" + c1))
          .append("div")
          .attr("class", "panel-body");

        panelBody.selectAll(".censusSubtype")
          .data(categories[c1])
          .enter().append("div")
          .attr("class", "row censusSubtype")
          .datum(function(c2) {
            return {
              mainType: c1,
              subType: c2,
              type: "census"
            };
          })
          .attr("id", d => _.kebabCase("sub_" + d.subType))
          .each(function(d) {
            let row = d3.select(this);

            row.append("span")
              .html(function(d) {
                return d.subType;
              });

            let btnGroup = row.append("div")
              .attr("class", "btn-group");

            btnGroup.append("button")
              .attr("class", "btn btn-success chartButton")
              .text("Chart")
              .on("click", chartButtonClick);

            btnGroup.append("button")
              .attr("class", "btn btn-success mapButton")
              .text("Map")
              .on("click", mapButtonClick);
          });
      });