/*jslint browser: true */
/*global ode: true, graph:true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';
    
    // simulate and plot a simple harmonic oscillator
    function plotSHO() {

        // get the drawing surface
        var canvas, context,
            sho, result, t, x, v, 
            phaseXAxis, phaseVAxis, phasePlot,
            timeAxis, xAxis, vAxis, xPlot, vPlot;

        // set up the canvas
        canvas = document.getElementById('SHOPlot');
        context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

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

        // set up axes for the phase plane plot
        phaseXAxis = graph.linearAxis(-1.5, 1.5, 0, 400);
        phaseVAxis = graph.linearAxis(-1.5, 1.5, 0, 400);
        phasePlot = graph.plotArea(phaseXAxis, phaseVAxis);

        timeAxis = graph.linearAxis(sho.tMin, sho.tMax, 0, 400);
        xAxis = graph.linearAxis(-1.5, 1.5, 400, 500);
        vAxis = graph.linearAxis(-1.5, 1.5, 500, 600);
        xPlot = graph.plotArea(timeAxis, xAxis);
        vPlot = graph.plotArea(timeAxis, vAxis);
           
        // plot the results
        phasePlot.addXYLine(x, v);
        xPlot.addXYLine(t, x);
        vPlot.addXYLine(t, v);

        phasePlot.draw(context);
        xPlot.draw(context);
        vPlot.draw(context);
    }

    document.getElementById('SHOButton').addEventListener('click', 
            plotSHO, false);
}, false);
