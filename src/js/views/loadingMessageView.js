"use strict";

var App = App || {};

let LoadingMessageView = function (loadingContainerDiv) {
    let self = {
        loadingContainer: null,
        statusText: null,
    };

    init();

    function init() {
        self.loadingContainer = d3.selectAll(loadingContainerDiv);
        self.statusText = self.loadingContainer.selectAll("#loading-message");
    }

    function updateAndRaise(msg){
        updateMessage(msg);
        self.loadingContainer.raise();
    }

    function updateMessage(msg){
        self.statusText.html(msg);
    }

    function showLoadingMessage(msg){
        if(msg) updateMessage(msg);
        self.loadingContainer.raise();
        self.loadingContainer.classed("hidden",false);
    }

    function hideLoadingMessage(){
        self.loadingContainer.lower();
        self.loadingContainer.classed("hidden",true);
    }

    return {
        updateMessage,
        showLoadingMessage,
        hideLoadingMessage,
        updateAndRaise
    };
};