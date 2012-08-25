/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 1000e-3; 

    // set up the controls for the voltage clamp simulation
    params = { 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120, minVal: 0.01, maxVal: 1000 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0.01, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        holdingPotential_mV: { label: 'Holding potential', units: 'mV', 
            defaultVal: -70, minVal: -1000, maxVal: 1000 },
        stepPotential_mV: { label: 'Step potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        stepStart_ms: { label: 'Step delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        stepWidth_ms: { label: 'Step duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-step interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['g_leak_uS', 'E_leak_mV',
            'g_Na_uS', 'E_Na_mV', 'g_K_uS', 'E_K_mV']],
        ['Voltage Clamp', ['holdingPotential_mV', 'stepPotential_mV',
            'stepStart_ms', 'stepWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('VoltageClampControls');

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain, hhKCurrent, hhNaCurrent, leakCurrent,
            result, t, v, iK, iNa, iLeak, hGate, mGate, nGate,
            t_ms, v_mV, iK_nA, iNa_nA, iLeak_nA, params,
            plotPanel, title, j, prerun, y0; 
        
        // create the clamped membrane
        params = controls.values;
        model = componentModel.componentModel();

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.stepStart_ms, 
            width: params.stepWidth_ms * 1e-3, 
            height: (params.stepPotential_mV - params.holdingPotential_mV) * 1e-3,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });

        neuron = electrophys.clampedMembrane({
            V_clamp: function (state, t) {
                return 1e-3 * params.holdingPotential_mV + pulseTrain(state, t);
            }
        });

        hhKCurrent = electrophys.hhKConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3
        });
        
        hhNaCurrent = electrophys.hhNaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3
        });

        leakCurrent = electrophys.passiveConductance(neuron, {
            g:     params.g_leak_uS * 1e-6,
            E_rev: params.E_leak_mV * 1e-3
        });

        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: 0, 
            tMax: 60e-3, 
            tMaxStep: 1e-4,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-4,
            y0: prerun.y_f
        });
        
        t = result.t;
        v = result.map(neuron.V);
        iK = result.map(hhKCurrent.current);
        iNa = result.map(hhNaCurrent.current);
        iLeak = result.map(leakCurrent.current);
        mGate = result.map(hhNaCurrent.m);
        hGate = result.map(hhNaCurrent.h);
        nGate = result.map(hhKCurrent.n);

        t_ms = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(t);
        v_mV = t.map(function (t) {return neuron.V([], t) / 1e-3; });
        iK_nA    = iK.map   (function (i) {return -i / 1e-9;});
        iNa_nA   = iNa.map  (function (i) {return -i / 1e-9;});
        iLeak_nA = iLeak.map(function (i) {return -i / 1e-9;});

        // plot the results
        plotPanel = document.getElementById('VoltageClampPlots');
        plotPanel.innerHTML = '';
        
        title = document.createElement('h4');
        title.innerHTML = 'Membrane potential (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, v_mV,
            {xUnits: 'ms', yUnits: 'mV'});

        title = document.createElement('h4');
        title.innerHTML = 'Na Current (nA)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, iNa_nA,
            {xUnits: 'ms', yUnits: 'nA'});

        title = document.createElement('h4');
        title.innerHTML = 'K Current (nA)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, iK_nA,
            {xUnits: 'ms', yUnits: 'nA'});

        title = document.createElement('h4');
        title.innerHTML = 'Leak Current (nA)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, iLeak_nA,
            {xUnits: 'ms', yUnits: 'nA'});

        title = document.createElement('h4');
        title.innerHTML = 'm Gate';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, mGate,
            {xUnits: 'ms', yUnits: ''});

        title = document.createElement('h4');
        title.innerHTML = 'h Gate';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, hGate,
            {xUnits: 'ms', yUnits: ''});

        title = document.createElement('h4');
        title.innerHTML = 'n Gate';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 150, t_ms, nGate,
            {xUnits: 'ms', yUnits: ''});
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('VoltageClampRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('VoltageClampResetButton')
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

