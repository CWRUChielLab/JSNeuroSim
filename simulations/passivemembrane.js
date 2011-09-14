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
        var model, passiveMembrane, pulseTrain,
            result, t, v, t_ms, v_mV, params, iStim_nA,
            plotPanel, title; 
        
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


        // plot the results
        plotPanel = document.getElementById('PassiveMembranePlots');
        plotPanel.innerHTML = '';
        
        title = document.createElement('h4');
        title.innerHTML = 'Membrane potential (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 400, 150, t_ms, v_mV,
            {xUnits: 'ms', yUnits: 'mV'});

        title = document.createElement('h4');
        title.innerHTML = 'Stimulation current (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 400, 70, t_ms, iStim_nA,
            {xUnits: 'ms', yUnits: 'nA'});
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
    

    // make the enter key run the simulation  
    panel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    reset();

}, false);

