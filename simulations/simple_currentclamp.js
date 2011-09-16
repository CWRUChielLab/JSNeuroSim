/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 1000e-3; 

    // set up the controls for the current clamp simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120., minVal: 0.01, maxVal: 1000 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0.01, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_leak_uS', 'E_leak_mV',
            'g_Na_uS', 'E_Na_mV', 'g_K_uS', 'E_K_mV']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('CurrentClampControls');

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain, hhKCurrent, hhNaCurrent,
            result, t, v, t_ms, v_mV, params, iStim_nA,
            plotPanel, title, j, prerun, y0; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        neuron = electrophys.passiveMembrane(model, {
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
        neuron.addCurrent(pulseTrain);
        
        hhKCurrent = electrophys.hhKConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3
        });
        
        hhNaCurrent = electrophys.hhNaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3
        });

        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: 0, 
            tMax: 60e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / 
                (params.g_leak_uS + params.g_Na_uS + params.g_K_uS) * 1e-3) 
        });
        y0 = [];
        for (j = 0; j < prerun.y.length; j += 1) {
            y0.push(prerun.y[j].pop());
        }

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / 
                (params.g_leak_uS + params.g_Na_uS + params.g_K_uS) * 1e-3),
            y0: y0
        });
        
        t = result.t;
        v = neuron.V(result.y, result.t);

        t_ms = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(t);
        v_mV = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(v);
      
        iStim_nA = t.map(function (t) {return pulseTrain([], t) / 1e-9; });


        // plot the results
        plotPanel = document.getElementById('CurrentClampPlots');
        plotPanel.innerHTML = '';
        
        title = document.createElement('h4');
        title.innerHTML = 'Membrane potential (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, v_mV,
            {xUnits: 'ms', yUnits: 'mV'});

        title = document.createElement('h4');
        title.innerHTML = 'Stimulation current (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 70, t_ms, iStim_nA,
            {xUnits: 'ms', yUnits: 'nA'});
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('CurrentClampRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('CurrentClampResetButton')
        .addEventListener('click', reset, false));
    

    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    reset();

}, false);

