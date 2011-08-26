/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, panel, controls, tMax = 1000e-3, 
        timeAxis, vAxis, vPlot, 
        iStimAxis, iStimPlot, 
        canvas, dragging,
        crosshairs, crosshairText, 
        xStart, yStart, measureLine, measureText, 
        crosshairs2, crosshairText2,
        xStart2, yStart2, measureLine2, measureText2;

    // set up the controls for the passive membrane simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 2, minVal: 0.01, maxVal: 100 }, 
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
        var canvas, context, model, passiveMembrane, pulseTrain,
            result, t, v, t_ms, v_mV, params, vMin_mV, vMax_mV,
            iStim_nA, iStimMin_nA, iStimMax_nA;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        passiveMembrane = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: params.g_leak_uS * 1e-6, 
            E_leak: params.E_leak_mV * 1e-3 
        });

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        passiveMembrane.addCurrent(pulseTrain);
        
        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / params.g_leak_uS * 1e-3) 
        });
        
        t = result.t;
        v = passiveMembrane.V(result.y, result.t);

        t_ms = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(t);
        v_mV = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(v);
      
        iStim_nA = t.map(function (t) {return pulseTrain([], t) / 1e-9; });

        // get the drawing surface
        canvas = document.getElementById('PassiveMembranePlot');
        context = canvas.getContext('2d');

        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // set up axes for the plot
        timeAxis = graph.linearAxis(t_ms[0], t_ms[t.length - 1], 0, 500);

        vMin_mV = Math.min(-10, Math.min.apply(null, v_mV) - 2);
        vMax_mV = Math.max(10, Math.max.apply(null, v_mV) + 2);
        vAxis = graph.linearAxis(vMin_mV, vMax_mV, 200, 0);
        vPlot = graph.plotArea(timeAxis, vAxis);

        vPlot.addText(t_ms[0], vMin_mV, vMin_mV.toFixed(0) + ' mV');
        vPlot.addText(t_ms[0], vMax_mV - 0.05 * (vMax_mV - vMin_mV), 
            vMax_mV.toFixed(0) + ' mV');


        iStimMin_nA = Math.min(-5, Math.min.apply(null, iStim_nA) - 2);
        iStimMax_nA = Math.max(15, Math.max.apply(null, iStim_nA) + 2);
        iStimAxis = graph.linearAxis(iStimMin_nA, iStimMax_nA, 350, 225);
        iStimPlot = graph.plotArea(timeAxis, iStimAxis);

        iStimPlot.addText(t_ms[0], iStimMin_nA, 
            iStimMin_nA.toFixed(0) + ' nA');
        iStimPlot.addText(t_ms[0], 
            iStimMax_nA - 0.07 * (iStimMax_nA - iStimMin_nA), 
            iStimMax_nA.toFixed(0) + ' nA');

           
        // plot the results
        vPlot.addXYLine(t_ms, v_mV);
        vPlot.draw(context);
        iStimPlot.addXYLine(t_ms, iStim_nA);
        iStimPlot.draw(context);
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
        var canvas, context, xDisplay, yDisplay, xWorld, 
            yWorld, yWorld2, canvasRect, point;


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
        point = evt.changedTouches ? evt.changedTouches[0] : evt;
        canvasRect = canvas.getBoundingClientRect();
        xDisplay = point.clientX - canvasRect.left;
        yDisplay = point.clientY - canvasRect.top;
        xWorld = timeAxis.mapDisplayToWorld(xDisplay);
        yWorld = vAxis.mapDisplayToWorld(yDisplay);
        crosshairs = vPlot.addPoints([xWorld], [yWorld]);
        crosshairText = vPlot.addText(xWorld + 0.01 * timeAxis.worldLength(), 
                yWorld + 0.01 * vAxis.worldLength(),
                "(" + xWorld.toFixed(2) + " ms, " 
                + yWorld.toFixed(2) + " mV)");

        if (start) {
            xStart = xWorld;
            yStart = yWorld;
        }
        measureLine = vPlot.addXYLine([xStart, xStart, xWorld], 
            [yStart, yWorld, yWorld]);
        if (xWorld === xStart && yWorld === yStart) {
            measureText = null;
        } else {
            measureText = vPlot.addText(xWorld + 0.01 * timeAxis.worldLength(), 
                yWorld - 0.05 * vAxis.worldLength(),
                "\u0394 (" + (xWorld - xStart).toFixed(2) + " ms, " 
                + (yWorld - yStart).toFixed(2) + " mV)");
        }

        // plot the results
        vPlot.draw(context);


        // get rid of the old crosshairs
        iStimPlot.remove(crosshairs2);
        iStimPlot.remove(crosshairText2);
        iStimPlot.remove(measureLine2);
        iStimPlot.remove(measureText2);

        // add new crosshairs
        yWorld2 = iStimAxis.mapDisplayToWorld(yDisplay);
        crosshairs2 = iStimPlot.addPoints([xWorld], [yWorld2]);
        crosshairText2 = iStimPlot.addText(xWorld + 0.01 * timeAxis.worldLength(), 
                yWorld2 + 0.02 * iStimAxis.worldLength(),
                "(" + xWorld.toFixed(2) + " ms, " 
                + yWorld2.toFixed(2) + " nA)");

        if (start) {
            yStart2 = yWorld2;
        }
        measureLine2 = iStimPlot.addXYLine([xStart, xStart, xWorld], [yStart2, yWorld2, yWorld2]);
        if (xWorld === xStart && yWorld2 === yStart2) {
            measureText2 = null;
        } else {
            measureText2 = iStimPlot.addText(xWorld + 0.01 * timeAxis.worldLength(), 
                yWorld2 - 0.06 * iStimAxis.worldLength(),
                "\u0394 (" + (xWorld - xStart).toFixed(2) + " ms, " 
                + (yWorld2 - yStart2).toFixed(2) + " nA)");
        }

        // plot the results
        iStimPlot.draw(context);
    }

    function dragStart(evt, element) {
        dragging = true;
        updateCrosshairs(evt, true);
        evt.preventDefault();
    } 

    function drag(evt, element) {
        if (dragging) {
            updateCrosshairs(evt);
            evt.preventDefault();
        }
    } 

    function dragEnd(evt, element) {
        dragging = false;
        evt.preventDefault();
    } 
    canvas = document.getElementById('PassiveMembranePlot');

    (canvas.addEventListener('mousedown', dragStart, false));
    (canvas.addEventListener('mousemove', drag, false));
    (canvas.addEventListener('mouseup', dragEnd, false));
    (canvas.addEventListener('mouseout', dragEnd, false));

    (canvas.addEventListener('touchstart', dragStart, true));
    (canvas.addEventListener('touchmove', drag, true));
    (canvas.addEventListener('touchend', dragEnd, true));
    (canvas.addEventListener('touchcancel', dragEnd, true));

    reset();

}, false);

