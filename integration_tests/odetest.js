/*jslint browser: true */
/*global ode: true, graph:true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';
    
    // simulate and plot a simple harmonic oscillator
    function plotSHO() {

        // get the drawing surface
        var sho, result, t, x, v, 
            phaseXAxis, phaseVAxis, phasePlot,
            timeAxis, xAxis, vAxis, xPlot, vPlot,
            plotPanel;

        // simulate the oscillator
        sho = {
            tMin: 0,
            tMax: 100,
            tMaxStep: 0.1,
            drift: function (y, t) { return [y[1], -y[0]]; }, 
            y0: [1, 0]
        };
        result = ode.integrate(sho);
        t = result.t;
        x = result.y[0];
        v = result.y[1];

        // plot the results
        plotPanel = document.getElementById('SHOPlots');
        graph.graph(plotPanel, 400, 400, x, v);
        plotPanel.appendChild(document.createElement('br'));
        graph.graph(plotPanel, 400, 100, t, x);
        plotPanel.appendChild(document.createElement('br'));
        graph.graph(plotPanel, 400, 100, t, v);
    }

    document.getElementById('SHOButton').addEventListener('click', 
            plotSHO, false);
}, false);
