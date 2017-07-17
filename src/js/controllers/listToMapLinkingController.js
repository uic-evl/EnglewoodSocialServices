"use strict";

let ListToMapLinkingController = function() {
  let self = {};

  function mapMarkerSelected(data) {
    let parentDiv = $("#serviceList");
    let dPanel = d3.selectAll(".serviceEntry")
      .filter((d) => d["Organization Name"] === data["Organization Name"]);

    let innerListItem = $(dPanel.nodes());

    parentDiv.animate({
        scrollTop: parentDiv.scrollTop() + (innerListItem.position().top - parentDiv.position().top) - parentDiv.height()/2 + innerListItem.height()/2
    }, 500);

    let expanded = !dPanel.selectAll(".collapse").classed("in");

    d3.selectAll("#serviceList").selectAll(".serviceEntry").classed("opened", false);
    dPanel.classed("opened", expanded);

    // $(".serviceEntry.collapse").collapse("hide");
    // $(".collapse", innerListItem).collapse(expanded ? "show" : "hide");
    $(".panel-heading", innerListItem).trigger("click");

    App.views.map.setSelectedService(expanded ? data : null);
  }

  function listServiceSelected(data) {
    App.views.map.setSelectedService(data);
  }


  return {
    mapMarkerSelected,
    listServiceSelected
  };
};
