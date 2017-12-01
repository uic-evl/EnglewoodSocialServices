"use strict";

// starplot config referenced from https://github.com/kevinschaul/d3-star-plot

let StarPlotView = function(options){
    let self = {
        parent: undefined, //parent element
        name: undefined,
        width: undefined,
        height: undefined,
        margin: {
            top: 0, bottom: 0,
            left: 0, right: 0
        },
        plotFn: undefined,
        svg: undefined,
        svgGroup: undefined
    };

    function init() {
        const plotRange = [0,100];

        self.parent = options.parent; //parent element as a d3 selection
        self.svg = options.svg; //optional, as a new svg will be created if not specified
        self.name = options.name;
        self.height = options.height;
        self.width = options.width;
        if(options.margin){
            for(let p of Object.keys(self.margin)){
                self.margin[p] = options.margin[p] || self.margin[p];
            }
        }

        /*
            options.axes = [
                {
                    min: <min val>,
                    max: <max val>,
                    label: <custom label> //optional
                    propertyName: <property-name>
                }
            ]
        */
        let properties = [], scales = [], labels = [];
        for(let a of options.axes){
            properties.push(a.propertyName);
            scales.push(
                d3.scaleLinear()
                    .domain([a.min, a.max])
                    .range(plotRange)
            );
            labels.push(a.label || a.propertyName);
        }
        self.plotFn = d3.starPlot()
            .properties(properties) //array of strings corresponding to properties of dataum
            .scales(scales)
            .labels(labels)
            .title(options.name);
    };

    init();

    /*
        data = {
            propertyName1: value,
            propertyName2: value,
            ...
        }
    */
    function render(data) {
        if(!self.svg){
            self.svg = self.parent.append("svg")
                .attr("width", self.width).attr("height", self.height)
                .style("width", self.width).style("height", self.height);
        }
        if(self.svgGroup){
            self.svgGroup.remove();
        }
        self.svgGroup = self.svg.append('g').attr("id","starplot-" + self.name);

        self.svgGroup.datum(data).call(self.plotFn)
            .style("transform", `translateX(${self.margin.left - self.margin.right}px) translateY(${self.margin.top - self.margin.bottom}px)`);

    }

    return {
        render
    };
};