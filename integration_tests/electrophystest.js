/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, panel, controls, tMax = 1000e-3, 
        timeAxis, vAxis, vPlot, 
        crosshairs, crosshairText,
        xStart, yStart, measureLine, measureText, dragging;

    // set up the controls for the passive membrane simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 2, minVal: 0.05, maxVal: 100 }, 
        g_leak_uS: { label: 'Membrane conductance', units: '\u00B5S', 
            defaultVal: 2, minVal: 0.01, maxVal: 100 }, 
        E_leak_mV: { label: 'Resting potential', units: 'mV',
            defaultVal: 0, minVal: -1000, maxVal: 1000 }, 
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_leak_uS', 'E_leak_mV']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    panel = document.getElementById('PassiveMembraneControls');

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var canvas, context, model, passiveMembrane,
            result, t, v, t_ms, v_mV, params, i;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        passiveMembrane = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: params.g_leak_uS * 1e-6, 
            E_leak: params.E_leak_mV * 1e-3 
        });

        for (i = 0; i < params.numPulses; i += 1) {
            passiveMembrane.addCurrent(electrophys.pulse({
                start: 1e-3 * (params.pulseStart_ms + 
                        i * (params.pulseWidth_ms + params.isi_ms)), 
                width: params.pulseWidth_ms * 1e-3, 
                height: params.pulseHeight_nA * 1e-9, 
            }));
        }
        
        // simulate it
        result = model.integrate({tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, tMaxStep: 1e-4 });
        
        t = result.t;
        v = passiveMembrane.V(result.y, result.t);

        t_ms = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(t);
        v_mV = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(v);
      
        // get the drawing surface
        canvas = document.getElementById('PassiveMembranePlot');
        context = canvas.getContext('2d');

        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // set up axes for the plot
        timeAxis = graph.linearAxis(t_ms[0], t_ms[t.length - 1], 0, 500);
        vAxis = graph.linearAxis(-10, 10, 200, 0);
        vPlot = graph.plotArea(timeAxis, vAxis);
           
        // plot the results
        vPlot.addXYLine(t_ms, v_mV);
        vPlot.draw(context);
    }
    
    function reset() {
        panel.innerHTML = '';
        controls = simcontrols.controls(panel, params, layout);
        runSimulation();
    }

    (document.getElementById('PassiveMembraneRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('PassiveMembraneResetButton')
        .addEventListener('click', reset, false));
    
    // make the enter key run the simulation (after a slight delay to allow
    // the edit box to fire a change event first).  
    panel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);


    function updateCrosshairs(evt, start) {
        var canvas, context, xDisplay, yDisplay, xWorld, yWorld, 
            canvasRect;


        // clear the canvas
        canvas = document.getElementById('PassiveMembranePlot');
        context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // get rid of the old crosshairs
        vPlot.remove(crosshairs);
        vPlot.remove(crosshairText);
        vPlot.remove(measureLine);
        vPlot.remove(measureText);

        // add new crosshairs
        canvasRect = canvas.getBoundingClientRect();
        xDisplay = evt.clientX - canvasRect.left;
        yDisplay = evt.clientY - canvasRect.top;
        xWorld = timeAxis.mapDisplayToWorld(xDisplay);
        yWorld = vAxis.mapDisplayToWorld(yDisplay);
        crosshairs = vPlot.addPoints([xWorld], [yWorld]);
        crosshairText = vPlot.addText(xWorld + 0.3, yWorld + 0.3,
                "(" + xWorld.toFixed(2) + " ms, " 
                + yWorld.toFixed(2) + " mV)");

        if (start) {
            xStart = xWorld;
            yStart = yWorld;
        }
        measureLine = vPlot.addXYLine([xStart, xStart, xWorld], [yStart, yWorld, yWorld]);
        if (xWorld === xStart && yWorld === yStart) {
            measureText = null;
        } else {
            measureText = vPlot.addText(xWorld + 0.3, yWorld - 1.3,
                "\u0394(" + (xWorld-xStart).toFixed(2) + " ms, " 
                + (yWorld-yStart).toFixed(2) + " mV)");
        }

        // plot the results
        vPlot.draw(context);
    }

    (document.getElementById('PassiveMembranePlot')
        .addEventListener('mousedown', function (evt, element) {
            dragging = true;
            updateCrosshairs(evt, true);
        }, false));

    (document.getElementById('PassiveMembranePlot')
        .addEventListener('mousemove', function (evt, element) {
            if (dragging) {
                updateCrosshairs(evt);
            }
        }, false));

    (document.getElementById('PassiveMembranePlot')
        .addEventListener('mouseout', function (evt, element) {
            dragging = false;
        }, false));

    (document.getElementById('PassiveMembranePlot')
        .addEventListener('click', function (evt, element) {
            if (dragging) {
                dragging = false;
                updateCrosshairs(evt);
            }
        }, false));

    reset();

}, false);


window.addEventListener('load', function () {
    'use strict';

    // simulate and plot the C2 neuron from Calin-Jageman et al 2007
    function plotC2() {
        var canvas, context, model, C2, C2Fast, C2Med, C2Slow,
            result, t, v, timeAxis, vAxis, vPlot;

        // get the drawing surface
        canvas = document.getElementById('C2Plot');
        context = canvas.getContext('2d');

        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // create the passive membrane
        model = componentModel.componentModel();
        C2 = electrophys.gettingIFNeuron(model, 
            { C: 2.27e-9, g_leak: 1 / 23.3e6, E_leak: -48e-3, 
                theta_ss: -34e-3, theta_r: 0e-3, theta_tau: 65.0e-3 });
        C2Fast = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.12000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:   30e-3 });
        C2Med = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.02800e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close: 1200e-3 });
        C2Slow = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.00300e-6, E_rev: -80e-3, tau_open: 4000e-3, 
                tau_close: 4000e-3 });

        C2.addCurrent(electrophys.pulse(
            {start: 1, width: 5, height: 2e-9}
        ));
        
        // simulate it
        result = model.integrate({tMin: 0, tMax: 7, tMaxStep: 2e-3});
        t = result.t;
        v = C2.VWithSpikes(result.y, result.t);

        // set up axes for the plot
        timeAxis = graph.linearAxis(t[0], t[t.length - 1], 0, 500);
        vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
        vPlot = graph.plotArea(timeAxis, vAxis);
           
        // plot the results
        vPlot.addXYLine(t, v);
        vPlot.draw(context);
    }

    document.getElementById('C2Button').addEventListener('click', 
            plotC2, false);
}, false);


window.addEventListener('load', function () {
    'use strict';

    // simulate and plot the DSI neuron from Calin-Jageman et al 2007
    function plotDSI() {
        var canvas, context, model, DSI, DSIShunt, DSIFast, DSISlow,
            result, t, v, timeAxis, vAxis, vPlot;

        // get the drawing surface
        canvas = document.getElementById('DSIPlot');
        context = canvas.getContext('2d');

        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // create the passive membrane
        model = componentModel.componentModel();
        DSI = electrophys.gettingIFNeuron(model, 
            { C: 1.5714765e-9, g_leak: 1 / 38.8e6, E_leak: -47.5e-3, 
                theta_ss: -50e-3, theta_r: 200e-3, theta_tau: 15.0e-3 });
        DSIShunt = electrophys.gettingShuntConductance(model, DSI,
            { G: 0.08e-6, E_rev: -47.5e-3, B_m: 29e-3, C_m: -1e-3, 
                tau_m: 10e-3, B_h: -100e-3, C_h: 1e-3, tau_h: 100000e-3 });
        DSIFast = electrophys.gettingSynapse(model, DSI, DSI, 
            { W: 0.30000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:   85e-3 });
        DSISlow = electrophys.gettingSynapse(model, DSI, DSI, 
            { W: 0.01200e-6, E_rev: -80e-3, tau_open:  200e-3, 
                tau_close: 2800e-3 });

        DSI.addCurrent(electrophys.pulse(
            {start: 0.5, width: 5, height: 3e-9}
        ));
        
        // simulate it
        result = model.integrate({tMin: -0.6, tMax: 7, tMaxStep: 2e-3});
        t = result.t;
        v = DSI.VWithSpikes(result.y, result.t);

        // set up axes for the plot
        timeAxis = graph.linearAxis(0, t[t.length - 1], 0, 500);
        vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
        vPlot = graph.plotArea(timeAxis, vAxis);
           
        // plot the results
        vPlot.addXYLine(t, v);
        vPlot.draw(context);
    }

    document.getElementById('DSIButton').addEventListener('click', 
            plotDSI, false);
}, false);


window.addEventListener('load', function () {
    'use strict';

    // simulate and plot the VSI neuron from Calin-Jageman et al 2007
    function plotVSI() {
        var canvas, context, model, VSI, VSIShunt, VSIFast, VSISlow,
            result, t, v, timeAxis, vAxis, vPlot;

        // get the drawing surface
        canvas = document.getElementById('VSIPlot');
        context = canvas.getContext('2d');

        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // create the passive membrane
        model = componentModel.componentModel();
        VSI = electrophys.gettingIFNeuron(model, 
            { C: 3.2e-9, g_leak: 1 / 14e6, E_leak: -56e-3, 
                theta_ss: -38e-3, theta_r: 10e-3, theta_tau: 10.0e-3 });
        VSIShunt = electrophys.gettingShuntConductance(model, VSI,
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                    B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3 });
        VSIFast = electrophys.gettingSynapse(model, VSI, VSI, 
            { W: 0.54000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:  100e-3 });
        VSISlow = electrophys.gettingSynapse(model, VSI, VSI, 
            { W: 0.00460e-6, E_rev: -80e-3, tau_open: 1000e-3, 
                tau_close: 2500e-3 });

        VSI.addCurrent(electrophys.pulse(
            {start: 0.5, width: 5, height: 2.5e-9}
        ));

        // simulate it
        result = model.integrate({tMin: -0.6, tMax: 7, tMaxStep: 2e-3});
        t = result.t;
        v = VSI.VWithSpikes(result.y, result.t);

        // set up axes for the plot
        timeAxis = graph.linearAxis(0, t[t.length - 1], 0, 500);
        vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
        vPlot = graph.plotArea(timeAxis, vAxis);
           
        // plot the results
        vPlot.addXYLine(t, v);
        vPlot.draw(context);
    }

    document.getElementById('VSIButton').addEventListener('click', 
            plotVSI, false);
}, false);
