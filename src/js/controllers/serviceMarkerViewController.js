"use strict";

var App = App || {};

let ServiceMarkerViewController = function(buttonID) {
    let self = {
        button: null,

        visibleMarkers: true,
        serviceMarkers: null,
        serviceMarkersSelection: null
    };

    init();

    function init() {
        self.button = d3.select(buttonID)
            .on("click", handleButtonClick);
    }

    //serviceMarkerArray is an array of L.marker() objects from the mapView.plotServices function
    //d3SelectionOfMarkers is from mapView.plotServices function
    function attachServiceMarkers(serviceMarkerArray,d3SelectionOfMarkers){
        self.serviceMarkers = serviceMarkerArray;
        self.serviceMarkersSelection = d3SelectionOfMarkers;
    }

    function handleButtonClick(){
        setVisibilityState(!self.visibleMarkers);
    }

    function setVisibilityState(bool){
        setServiceMarkerVisibility(bool == true); //enforce true or false
        let buttonGlyph = self.button.select('.glyphicon');
        let buttonText = self.button.select('#serviceViewText');
        buttonGlyph.classed('glyphicon-eye-close', self.visibleMarkers);
        buttonGlyph.classed('glyphicon-eye-open', !self.visibleMarkers);
        if (self.visibleMarkers) {
            buttonText.text("Hide Service Markers");
        } else {
            buttonText.text("Show Service Markers");
        }
    }

    function setServiceMarkerVisibility(bool) {
        self.visibleMarkers = (bool == true); //true = visible, false = invisible
        let opacity = bool ? 1 : 0;

        for (let m of self.serviceMarkers) {
            m.setOpacity(opacity);
            m.closePopup();
        }

        self.serviceMarkersSelection.classed('disabled-marker', !bool);

    }

    function markersAreVisible(){
        return self.visibleMarkers == true;
    }

    return {
        markersAreVisible,
        attachServiceMarkers,
        setVisibilityState
    }
}