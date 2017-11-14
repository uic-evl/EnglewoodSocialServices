"use strict";

var App = App || {};

let BrowserModel = function() {
    let self = {

    };

    // based off of https://stackoverflow.com/questions/2324944/in-javascript-how-do-i-determine-if-my-current-browser-is-firefox-on-a-computer
    function getBrowser() {
        let agent = navigator.userAgent;
        let browsers = [
            { name: "Edge", identifier: "Edge" },
            { name: "Opera", identifier: "OPR" },
            { name: "Internet Explorer", identifier: "MSIE"},
            { name: "Chrome", identifier: "Chrome" },
            { name: "Firefox", identifier: "Firefox" },
            // { name: "Safari", identifier: "Safari" }, //disabled, as most agents have safari in them
        ];
        let browser = browsers.reduce((acc, b) => agent.indexOf(b.identifier) > -1 ? (acc || b.name) : acc, undefined);

        return browser || "Unknown";
    }

    function isValidBrowser() {
        return ['Firefox', 'Chrome'].indexOf(getBrowser()) > -1;
    }

    return {
        getBrowser,
        isValidBrowser
    };
}