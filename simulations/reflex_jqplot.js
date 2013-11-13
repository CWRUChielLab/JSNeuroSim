/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel,
        lengthDataTable, forceDataTable, spindleVDataTable, alphaMNVDataTable,
        tMax = 10000e-3, plotHandles = []; 

    // set up the controls
    params = {
        Linit_cm: { label: 'Initial length', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        m_g: { label: 'Mass', units: 'g',
            defaultVal: 100, minVal: 1, maxVal: 10000.0 },
        B_ms_cm: { label: 'Force-velocity constant', units: 'ms/cm',
            defaultVal: 0, minVal: 0, maxVal: 10000.0 },
        beta_g_ms: { label: 'Damping constant', units: 'g/ms',
            defaultVal: 50, minVal: 0, maxVal: 10000.0 },
        Lrestpas_cm: { label: 'Resting position', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        c1_mN: { label: 'Passive force multiplier', units: 'mN',
            defaultVal: 0, minVal: 0, maxVal: 10000 },
        activation_tau: { label: 'Activation time constant', units: 'ms',
            defaultVal: 150, minVal: 0.1, maxVal: 10000.0 },

        Lrestspring_cm: { label: 'Spring resting position', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        k: { label: 'Spring stiffness', units: 'N/cm',
            defaultVal: 1.0, minVal: 0, maxVal: 10.0 },

        spindle_Ks: { label: 'Static gain', units: 'nA/mN',
            defaultVal: 0.2, minVal: 0, maxVal: 100},
        spindle_Kd_positive: { label: 'Positive dynamic gain', units: 'pC/mN',
            defaultVal: 14, minVal: 0, maxVal: 10000},
        spindle_Kd_negative: { label: 'Negative dynamic gain', units: 'pC/mN',
            defaultVal: 0, minVal: -10000, maxVal: 10000},
            
        spindle_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        spindle_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        spindle_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        spindle_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
            
        spindle_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        spindle_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        spindle_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },

        reflexThreshold_cm: { label: 'Reflex threshold length', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        reflexConstant_cm: { label: 'Reflex activation length constant', units: 'cm',
            defaultVal: 1e8, minVal: 0.1, maxVal: 1e12 },

		alphaMN_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        alphaMN_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2, minVal: 0.01, maxVal: 100 },
        alphaMN_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.05, minVal: 0.01, maxVal: 100 },
        alphaMN_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        alphaMN_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        alphaMN_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        alphaMN_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },

        spindleToAlphaMN_g_uS: { label: 'Synapse conductance', 
            units: '\u00B5S', defaultVal: 0.05, minVal: 0, maxVal: 100 },
        spindleToAlphaMN_E_mV: { label: 'Synapse potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        spindleToAlphaMN_tau_rise_ms: { units: 'ms', 
            label: 'Synapse rise time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        spindleToAlphaMN_tau_fall_ms: { units: 'ms', 
            label: 'Synapse fall time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },

        nmj_gain: { label: 'Synapse strength', units: 'mV<sup>-1</sup>',
            defaultVal: 0.1, minVal: 0, maxVal: 10000 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 },
    };

    layout = [
        ['Muscle Properties', ['Linit_cm', 'm_g', 'beta_g_ms', 'activation_tau']],
        ['Spring Properties', ['Lrestspring_cm', 'k']],
        ['Spindle Cell Properties', ['spindle_V_init_mV', 'spindle_C_nF', 'spindle_g_leak_uS', 'spindle_E_leak_mV',
            'spindle_theta_ss_mV', 'spindle_theta_r_mV', 'spindle_theta_tau_ms', 'reflexThreshold_cm', 'reflexConstant_cm']],
        ['Alpha Motor Neuron Properties', ['alphaMN_V_init_mV', 'alphaMN_C_nF', 'alphaMN_g_leak_uS', 'alphaMN_E_leak_mV',
            'alphaMN_theta_ss_mV', 'alphaMN_theta_r_mV', 'alphaMN_theta_tau_ms']],
        ['Spindle to Alpha Synapse Properties', ['spindleToAlphaMN_g_uS', 'spindleToAlphaMN_E_mV',
            'spindleToAlphaMN_tau_rise_ms', 'spindleToAlphaMN_tau_fall_ms']],
        ['Neuromuscular Junction Properties', ['nmj_gain']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];

    controlsPanel = document.getElementById('MuscleControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MuscleData');
    dataPanel.className = 'datapanel';

    lengthDataTable = document.createElement('table');
    lengthDataTable.className = 'datatable';
    dataPanel.appendChild(lengthDataTable);

    forceDataTable = document.createElement('table');
    forceDataTable.className = 'datatable';
    dataPanel.appendChild(forceDataTable);

    spindleVDataTable = document.createElement('table');
    spindleVDataTable.className = 'datatable';
    dataPanel.appendChild(spindleVDataTable);

    alphaMNVDataTable = document.createElement('table');
    alphaMNVDataTable.className = 'datatable';
    dataPanel.appendChild(alphaMNVDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, muscle, spindle, alphaMN, synapse,
            result, L, Lprime, spindleV, alphaMNV, force,
            plotPanel, title, plot; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        spindle = electrophys.gettingIFNeuron(model, { 
            V_rest: params.spindle_V_init_mV * 1e-3, 
            C: params.spindle_C_nF * 1e-9, 
            g_leak: params.spindle_g_leak_uS * 1e-6, 
            E_leak: params.spindle_E_leak_mV * 1e-3, 
            theta_ss: params.spindle_theta_ss_mV * 1e-3, 
            theta_r: params.spindle_theta_r_mV * 1e-3, 
            theta_tau: params.spindle_theta_tau_ms * 1e-3
        });

        alphaMN = electrophys.gettingIFNeuron(model, { 
            V_rest: params.alphaMN_V_init_mV * 1e-3, 
            C: params.alphaMN_C_nF * 1e-9, 
            g_leak: params.alphaMN_g_leak_uS * 1e-6, 
            E_leak: params.alphaMN_E_leak_mV * 1e-3, 
            theta_ss: params.alphaMN_theta_ss_mV * 1e-3, 
            theta_r: params.alphaMN_theta_r_mV * 1e-3, 
            theta_tau: params.alphaMN_theta_tau_ms * 1e-3
        });

        synapse = electrophys.gettingSynapse(model, spindle, alphaMN, { 
            W: params.spindleToAlphaMN_g_uS * 1e-6, 
            E_rev: params.spindleToAlphaMN_E_mV * 1e-3, 
            tau_open: params.spindleToAlphaMN_tau_rise_ms * 1e-3, 
            tau_close: params.spindleToAlphaMN_tau_fall_ms * 1e-3, 
        });

        muscle = electrophys.muscleFullDynamics(model, {
            Linit: params.Linit_cm,
            m: params.m_g,
            B: params.B_ms_cm * 1e-3,
            beta: params.beta_g_ms * 1e3,
            p: 1 / params.activation_tau * 1e3,
            Lrestspring: params.Lrestspring_cm,
            c1: params.c1_mN * 1e-3,
            Lrestpas: params.Lrestpas_cm,
            k: params.k
        });

        // add proprioception
        spindle.addCurrent(function (state, t) {
            return Math.min(2e-9, Math.max(0, 1/params.reflexConstant_cm * (muscle.L(state, t) - params.reflexThreshold_cm)));
        });

        // add neuromuscular junction
        muscle.setNeuralInput(function (state, t) {
           return Math.max(0, params.nmj_gain * (alphaMN.V(state, t) * 1e3 - (params.alphaMN_theta_ss_mV)));
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-3
        });
        
        L        = result.mapOrderedPairs(muscle.L);
        Lprime   = result.mapOrderedPairs(muscle.Lprime);
        force    = result.mapOrderedPairs(muscle.force);
        spindleV = result.mapOrderedPairs(spindle.VWithSpikes);
        alphaMNV = result.mapOrderedPairs(alphaMN.VWithSpikes);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        L        = L.map        (function (l) {return [l[0] / 1e-3, l[1]       ];});
        Lprime   = Lprime.map   (function (v) {return [v[0] / 1e-3, v[1] / 1e3 ];});
        spindleV = spindleV.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        alphaMNV = alphaMNV.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        force    = force.map    (function (f) {return [f[0] / 1e-3, f[1] / 1e-3];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('MusclePlots');
        plotPanel.innerHTML = '';

        // ******************
        // MUSCLE
        // ******************

        title = document.createElement('h4');
        title.innerHTML = 'Muscle Properties';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Muscle length
        plot = document.createElement('div');
        plot.id = 'lengthPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('lengthPlot', [L], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Length (cm)',
                        min: 0,
                    },
                },
                series: [
                    {label: 'Length', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#lengthPlot', lengthDataTable, 'Muscle Length', 'Time');
        graphJqplot.bindCursorTooltip('#lengthPlot', 'Time', 'ms', 'cm');

        // Muscle force
        plot = document.createElement('div');
        plot.id = 'forcePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('forcePlot', [force], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Force (mN)'},
                },
                series: [
                    {label: 'Force', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#forcePlot', forceDataTable, 'Muscle Force', 'Time');
        graphJqplot.bindCursorTooltip('#forcePlot', 'Time', 'ms', 'mN');

        // ******************
        // SPINDLE
        // ******************

        title = document.createElement('h4');
        title.innerHTML = 'Spindle Fiber Neuron Properties';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Spindle membrane potential
        plot = document.createElement('div');
        plot.id = 'spindleVPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('spindleVPlot', [spindleV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#spindleVPlot', spindleVDataTable, 'Spindle Fiber Neuron Membrane Potential', 'Time');
        graphJqplot.bindCursorTooltip('#spindleVPlot', 'Time', 'ms', 'mV');

        // ******************
        // ALPHA MOTOR NEURON
        // ******************

        title = document.createElement('h4');
        title.innerHTML = 'Alpha Motor Neuron Properties';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Spindle membrane potential
        plot = document.createElement('div');
        plot.id = 'alphaMNVPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('alphaMNVPlot', [alphaMNV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#alphaMNVPlot', alphaMNVDataTable, 'Alpha Motor Neuron Membrane Potential', 'Time');
        graphJqplot.bindCursorTooltip('#alphaMNVPlot', 'Time', 'ms', 'mV');
    }

    
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function resetToDefaultSim() {
        reset(params, layout);
    }


    function clearDataTables() {
        lengthDataTable.innerHTML = '';
        lengthDataTable.style.display = 'none';

        forceDataTable.innerHTML = '';
        forceDataTable.style.display = 'none';

        spindleVDataTable.innerHTML = '';
        spindleVDataTable.style.display = 'none';

        alphaMNVDataTable.innerHTML = '';
        alphaMNVDataTable.style.display = 'none';
    }


    (document.getElementById('ReflexRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('ReflexResetButton')
        .addEventListener('click', resetToDefaultSim, false));
    (document.getElementById('ReflexClearDataButton')
        .addEventListener('click', clearDataTables, false));
    

    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    resetToDefaultSim();
    clearDataTables();

}, false);

