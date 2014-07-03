/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel,
        lengthDataTable, forceDataTable, spindleVDataTable, alphaMNVDataTable,
        tMax = 10000e-3, plotHandles = []; 
        
    // Set up the graphics
    var animationPanel = document.getElementById('ReflexAnimation'),
        paper = Raphael(animationPanel, 2000, 450),
        
        startTibiaAngle = -1.36678,        
        tibiaKneeX = 715, tibiaKneeY = 90, tibiaAnkleX1 = 775, tibiaAnkleY1 = 380, tibiaAnkleX2, tibiaAnkleY2,
        startTibia = 'M ' + tibiaKneeX + ' ' + tibiaKneeY + ' L ' + tibiaAnkleX1 + ' ' + tibiaAnkleY1,
        endTibia,// = 'M 710 80 L 919 289',
        tibia = paper.path(startTibia).attr({stroke: '#EED999', 'stroke-width': 30}),
        tibiaLength = 296,
        
        startFootHeelAngle = -1.41839,
        startFootToesAngle = -1.11832,
        footHeelX1 = 762, footHeelY1 = 396, footToesX1 = 855, footToesY1 = 378, footHeelX2, footHeelY2, footToesX2, footToesY2,
        startFoot = 'M ' + footHeelX1 + ' ' + footHeelY1 + ' L ' + footToesX1 + ' ' + footToesY1,
        endFoot,
        foot = paper.path(startFoot).attr({stroke: '#EED999', 'stroke-width': 24}),
        kneeToHeelLength = 310,
        kneeToToesLength = 320,
        
        femur = paper.path('M 310 75 L 690 75').attr({stroke: '#EED999', 'stroke-width': 30}),
        quadriceps = paper.ellipse(500, 50, 200, 20).attr({fill: '#FF4444', stroke: 'black'}),
        quadricepsEndWidth = 200,
        hamstring = paper.ellipse(495, 105, 190, 20).attr({fill: '#FF4444', stroke: 'black'}),
        
        spinalCord = paper.ellipse(100, 100, 70, 70).attr({stroke: 'black', fill: 'silver'}),
        afferentNerve = paper.path('M 100 85 S 250 0 500 50').attr({stroke: 'grey', 'stroke-width': 8, 'stroke-opacity': .5}),
        interNeuron = paper.path('M 100 85 L 100 115').attr({stroke: 'grey', 'stroke-width': 8, 'stroke-opacity': .5}),
        motorNerve = paper.path('M 100 85 S 300 100 500 55').attr({stroke: 'grey', 'stroke-width': 8, 'stroke-opacity': .5}),
        inhibitoryNerve = paper.path('M 100 115 S 300 200 500 105').attr({stroke: 'grey', 'stroke-width': 8, 'stroke-opacity': .5}),
        
        patellarTendonPath1 = 'M 700 50 S 710 70 733 87',
        patellarTendonPath2,
        patellarTendonPath3,
        patellarTendon1 = paper.path(patellarTendonPath1).attr({'stroke-width': 3}),
        patellarTendon2 = paper.path(patellarTendonPath2).attr({'stroke-width': 3, opacity: 0}),
        hamstringTendonPath1 = 'M 685 105 S 690 102 698 93',
        hamstringTendonPath2,
        hamstringTendon = paper.path(hamstringTendonPath1).attr({'stroke-width': 2}),  
        
        afferentNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
        interNeuronTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
        motorNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 1}),
        inhibitoryNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 1}),
        
        scaleFactor = 1,
        defaultLength = 90,
        reflex,
        
        startHammer = 'M 733 55 L 730 50 L 770 10 L 785 30 Z',
        endHammer = 'M 713 75 L 710 70 L 750 30 L 765 50 Z',
        hammer1 = paper.path(startHammer).attr({'stroke-width': 2}),
        hammer2 = paper.path(endHammer).attr({'stroke-width': 2, opacity: 0});
        
            
    motorNerveTracker.animate({opacity: 0}, 1);
    inhibitoryNerveTracker.animate({opacity: 0}, 1);
        

    // set up the controls
    params = {
        Lstretch_mm: { label: 'Stetch', units: 'mm',
            defaultVal: 0, minVal: 0, maxVal: 10 },
        m_g: { label: 'Mass', units: 'g',
            defaultVal: 8000, minVal: 7000, maxVal: 8500 },
        B_ms_cm: { label: 'Force-velocity constant', units: 'ms/cm',
            defaultVal: 0, minVal: 0, maxVal: 10000.0 },
        beta_g_ms: { label: 'Damping constant', units: 'g/ms',
            defaultVal: 50, minVal: 0, maxVal: 10000.0 },
        Lrestpas_cm: { label: 'Resting position', units: 'cm',
            defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
        c1_mN: { label: 'Passive force multiplier', units: 'mN',
            defaultVal: 0, minVal: 0, maxVal: 10000 },
        activation_tau: { label: 'Activation time constant', units: 'ms',
            defaultVal: 1, minVal: 0.1, maxVal: 10000.0 },

        Lrestspring_cm: { label: 'Spring resting position', units: 'cm',
            defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
        k: { label: 'Spring stiffness', units: 'N/cm',
            defaultVal: 1, minVal: 0, maxVal: 10.0 },

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
            defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
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
            units: '\u00B5S', defaultVal: 0.05, minVal: 0, maxVal: 1 },
        spindleToAlphaMN_E_mV: { label: 'Synapse potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        spindleToAlphaMN_tau_rise_ms: { units: 'ms', 
            label: 'Synapse rise time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        spindleToAlphaMN_tau_fall_ms: { units: 'ms', 
            label: 'Synapse fall time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },

        nmj_gain: { label: 'Synapse strength', units: 'mV<sup>-1</sup>',
            defaultVal: 0.01, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 },
    };

    layout = [
        ['Muscle Properties', ['Lstretch_mm']],//, 'm_g', 'beta_g_ms', 'activation_tau']],
        //['Spring Properties', ['Lrestspring_cm', 'k']],
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
            Linit: params.Lrestpas_cm + params.Lstretch_mm / 10,
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
                        min: 85, max: 95,
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
        
        
        
        
        // Animation calculations
        
        var forceIntegral = 0,
            reflexAngle = 0;
            
        for (var i = 0; i < force.length - 1; i++) {
            forceIntegral += (force[i + 1][1]) * (force[i + 1][0] - force[i][0]);
        }
        
        reflexAngle = (-1.13603 * Math.pow(10, -17)) - (6.82844 * Math.pow(10, -7) * forceIntegral) -
                      (8.54039 * Math.pow(10, -13) * Math.pow(forceIntegral, 2)) - 
                      (5.7811 * Math.pow(10, -19) * Math.pow(forceIntegral, 3));
        
        tibiaAnkleX2 = tibiaKneeX + tibiaLength * Math.cos(startTibiaAngle + reflexAngle);
        tibiaAnkleY2 = tibiaKneeY - tibiaLength * Math.sin(startTibiaAngle + reflexAngle);
        endTibia = 'M ' + tibiaKneeX + ' ' + tibiaKneeY + ' L ' + tibiaAnkleX2 + ' ' + tibiaAnkleY2;
        
        footHeelX2 = tibiaKneeX + kneeToHeelLength * Math.cos(startFootHeelAngle + reflexAngle);
        footHeelY2 = tibiaKneeY - kneeToHeelLength * Math.sin(startFootHeelAngle + reflexAngle);
        footToesX2 = tibiaKneeX + kneeToToesLength * Math.cos(startFootToesAngle + reflexAngle);
        footToesY2 = tibiaKneeY - kneeToToesLength * Math.sin(startFootToesAngle + reflexAngle);        
        endFoot = 'M ' + footHeelX2 + ' ' + footHeelY2 + ' L ' + footToesX2 + ' ' + footToesY2;
        
        quadricepsEndWidth = 200 - (-forceIntegral / 30000);
        
        scaleFactor = (params.Lstretch_mm) / (10 * defaultLength);
        
        var patellarTendonLeftX1 = 700,
            patellarTendonLeftY1 = 50,
            patellarTendonMidX1 = 710,
            patellarTendonMidY1 = 70,
            patellarTendonRightX1 = Math.round(tibiaKneeX + Math.cos(startTibiaAngle + Math.PI / 2) * 15),
            patellarTendonRightY1 = Math.round(tibiaKneeY - Math.sin(startTibiaAngle + Math.PI / 2) * 15) + 3,
            
            patellarTendonLeftX2 = 700,
            patellarTendonLeftY2 = 50,
            patellarTendonMidX2 = Math.round(710 - scaleFactor * 900),
            patellarTendonMidY2 = Math.round(70 + scaleFactor * 900),
            patellarTendonRightX2 = Math.round(tibiaKneeX + Math.cos(startTibiaAngle + Math.PI / 2) * 15),
            patellarTendonRightY2 = Math.round(tibiaKneeY - Math.sin(startTibiaAngle + Math.PI / 2) * 15) + 3,
            
            patellarTendonLeftX3 = 500 + quadricepsEndWidth,
            patellarTendonLeftY3 = 50,
            patellarTendonMidX3 = 705,
            patellarTendonMidY3 = 60,
            patellarTendonRightX3 = Math.round(tibiaKneeX + Math.cos(startTibiaAngle + reflexAngle + Math.PI / 2) * 15),
            patellarTendonRightY3 = Math.round(tibiaKneeY - Math.sin(startTibiaAngle + reflexAngle + Math.PI / 2) * 15) + 3,
            
            hamstringTendonLeftX1 = 685,
            hamstringTendonLeftY1 = 105,
            hamstringTendonMidX1 = 690,
            hamstringTendonMidY1 = 102,
            hamstringTendonRightX1 = Math.round(tibiaKneeX + Math.cos(startTibiaAngle - Math.PI / 2) * 15) + 3,
            hamstringTendonRightY1 = Math.round(tibiaKneeY - Math.sin(startTibiaAngle - Math.PI / 2) * 15),
            
            hamstringTendonLeftX2 = 700,
            hamstringTendonLeftY2 = 105,
            hamstringTendonMidX2 = 695,
            hamstringTendonMidY2 = 102,
            hamstringTendonRightX2 = Math.round(tibiaKneeX + Math.cos(startTibiaAngle + reflexAngle - Math.PI / 2) * 15) + 3,
            hamstringTendonRightY2 = Math.round(tibiaKneeY - Math.sin(startTibiaAngle + reflexAngle - Math.PI / 2) * 15),
            
            hammerX1 = Math.round(715 - scaleFactor * 350),
            hammerX2 = Math.round(712 - scaleFactor * 350),
            hammerX3 = Math.round(752 - scaleFactor * 350),
            hammerX4 = Math.round(767 - scaleFactor * 350),
            hammerY1 = Math.round(73 + scaleFactor * 350),
            hammerY2 = Math.round(68 + scaleFactor * 350),
            hammerY3 = Math.round(28 + scaleFactor * 350),
            hammerY4 = Math.round(48 + scaleFactor * 350);

        patellarTendonPath1 = 'M ' + patellarTendonLeftX1 + ' ' + patellarTendonLeftY1 + ' S ' + patellarTendonMidX1 + ' ' +
                              patellarTendonMidY1 + ' ' + patellarTendonRightX1 + ' ' + patellarTendonRightY1,
        patellarTendonPath2 = 'M ' + patellarTendonLeftX2 + ' ' + patellarTendonLeftY2 + ' S ' + patellarTendonMidX2 + ' ' +
                              patellarTendonMidY2 + ' ' + patellarTendonRightX2 + ' ' + patellarTendonRightY2,
        patellarTendonPath3 = 'M ' + patellarTendonLeftX3 + ' ' + patellarTendonLeftY3 + ' S ' + patellarTendonMidX3 + ' ' +
                              patellarTendonMidY3 + ' ' + patellarTendonRightX3 + ' ' + patellarTendonRightY3,
        hamstringTendonPath1 = 'M ' + hamstringTendonLeftX1 + ' ' + hamstringTendonLeftY1 + ' S ' + hamstringTendonMidX1 + ' ' +
                              hamstringTendonMidY1 + ' ' + hamstringTendonRightX1 + ' ' + hamstringTendonRightY1,
        hamstringTendonPath2 = 'M ' + hamstringTendonLeftX2 + ' ' + hamstringTendonLeftY2 + ' S ' + hamstringTendonMidX2 + ' ' +
                              hamstringTendonMidY2 + ' ' + hamstringTendonRightX2 + ' ' + hamstringTendonRightY2,

        startHammer = 'M 733 55 L 730 50 L 770 10 L 785 30 Z';
        endHammer = 'M ' + hammerX1 + ' ' + hammerY1 + ' L ' + hammerX2 + ' ' + hammerY2 + 
                    ' L ' + hammerX3 + ' ' + hammerY3 + ' L ' + hammerX4 + ' ' + hammerY4 + ' Z';
                    
        
        if (forceIntegral == 0) {
            reflex = false;
        } else {
            reflex = true;
        };
        
        resetAnimation();
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
    
    // Functions for animation along a path
    Raphael.fn.addGuides = function() {
        this.ca.guide = function(g) {
          return {
            guide: g
          };
        };
        this.ca.along = function(percent) {
          var g = this.attr("guide");
          var len = g.getTotalLength();
          var point = g.getPointAtLength(percent * len);
          var t = {
            transform: "t" + point.x + " " + point.y
          };
          return t;
        };
        this.ca.alongRight = function(percent) {
          var g = this.attr("guide");
          var len = g.getTotalLength();
          var point = 1 - g.getPointAtLength(percent * len);
          var t = {
            transfor: "t" + point.x + " " + point.y
          };
          return t;
        }
     };
    paper.addGuides();
    
    // Animation functions
    var leftTrack = function (tracker, track, duration, delay) {            
            tracker.attr({guide: track, along: 0}).animate(Raphael.animation({along: 1}, duration).delay(delay));        
        },
        rightTrack = function (tracker, track, duration, delay) {            
            tracker.attr({guide: track, along: 1}).animate(Raphael.animation({along: 0}, duration).delay(delay));        
        },    
        contractMuscle = function (muscle, endLength, endWidth, duration, delay) {
            muscle.animate(Raphael.animation({rx: endLength, ry: endWidth}, duration).delay(delay));
        },
        moveMuscle = function (muscle, x, y, angle, duration, delay) {
            muscle.animate(Raphael.animation({transform: 'T' + x + ' ' + y + 'r' + angle}, duration).delay(delay));
        },
        colorChange = function (muscle, color, duration, delay) {
            muscle.animate(Raphael.animation({fill: color}, duration).delay(delay));
        },        
        movePath = function (path, pathString, duration, delay) {
            path.animate(Raphael.animation({path: pathString}, duration).delay(delay));
        },
        changeOpacity = function (tracker, opacity, duration, delay) {
            tracker.animate(Raphael.animation({'opacity': opacity}, duration).delay(delay));
        };
    
    function resetAnimation() {
        quadriceps.attr({fill: '#FF4444', rx: 200, ry: 20});
        hamstring.attr({fill: '#FF4444', rx: 190, ry: 20});
        tibia.attr({path: startTibia});
        foot.attr({path: startFoot});
        patellarTendon1.attr({path: patellarTendonPath1, opacity: 1});
        patellarTendon2.attr({path: patellarTendonPath2, opacity: 0})
        hamstringTendon.attr({path: hamstringTendonPath1});
        motorNerveTracker.attr({fill: 'black', rx: 4, ry: 4, opacity: 1});
        inhibitoryNerveTracker.attr({fill: 'black', rx: 4, ry: 4, opacity: 1});
        hammer1.attr({path: startHammer, opacity: 1});
        hammer2.attr({path: endHammer, opacity: 0});
        
        changeOpacity(motorNerveTracker, 0, 1, 0);
        changeOpacity(inhibitoryNerveTracker, 0, 1, 0);
        
    }
        
    function reflexAnimation() {
        var totalAnimTime;
        if (!reflex) {
            totalAnimTime = 2000;
        } else { 
            totalAnimTime = 11000;
        }
        document.getElementById('ReflexRunButton').disabled = true;
        setTimeout(function(){document.getElementById('ReflexRunButton').disabled = false}, totalAnimTime);
        document.getElementById('ReflexAnimationButton').disabled = true;
        setTimeout(function(){document.getElementById('ReflexAnimationButton').disabled = false}, totalAnimTime);
        document.getElementById('ResetAnimationButton').disabled = true;
        setTimeout(function(){document.getElementById('ResetAnimationButton').disabled = false}, totalAnimTime);
        
        
        resetAnimation();        
    
        movePath(hammer1, endHammer, 1000, 0);
        movePath(patellarTendon1, patellarTendonPath2, 100, 900);
        
        changeOpacity(patellarTendon2, 1, 1, 1200);
        changeOpacity(patellarTendon1, 0, 1, 1500);
        changeOpacity(hammer2, 1, 1, 1200);
        changeOpacity(hammer1, 0, 1, 1500);
        movePath(hammer2, startHammer, 1000, 2000);
        
        if (reflex) {
            changeOpacity(afferentNerveTracker, 1, 1, 1000);
            rightTrack(afferentNerveTracker, afferentNerve, 3000, 1000);
            changeOpacity(afferentNerveTracker, 0, 1, 4500);
            
            changeOpacity(interNeuronTracker, 1, 1, 4400);
            leftTrack(interNeuronTracker, interNeuron, 500, 4500);
            changeOpacity(interNeuronTracker, 0, 1, 5000);
            
            changeOpacity(motorNerveTracker, 1, 1, 4400);
            leftTrack(motorNerveTracker, motorNerve, 3000, 4500);
            colorChange(motorNerveTracker, 'red', 500, 8000),
            contractMuscle(motorNerveTracker, 150, 20, 500, 8000);
            changeOpacity(motorNerveTracker, 0, 500, 8000);
            
            changeOpacity(inhibitoryNerveTracker, 1, 1, 4900);
            leftTrack(inhibitoryNerveTracker, inhibitoryNerve, 2500, 5000);
            colorChange(inhibitoryNerveTracker, 'white', 500, 8000),
            contractMuscle(inhibitoryNerveTracker, 150, 20, 500, 8000);
            changeOpacity(inhibitoryNerveTracker, 0, 500, 8000);
            
            contractMuscle(quadriceps, quadricepsEndWidth, 25, 2000, 9000);
            colorChange(quadriceps, '#E60000', 200, 9000);
            contractMuscle(hamstring, 205, 15, 2000, 9000);
            colorChange(hamstring, '#FF9999', 200, 9000);
            
            movePath(patellarTendon2, patellarTendonPath3, 2000, 9000);
            movePath(hamstringTendon, hamstringTendonPath2, 2000, 9000);
            movePath(tibia, endTibia, 2000, 9000);
            movePath(foot, endFoot, 2000, 9000);
        }

    }


    (document.getElementById('ReflexRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('ReflexResetButton')
        .addEventListener('click', resetToDefaultSim, false));
    (document.getElementById('ReflexClearDataButton')
        .addEventListener('click', clearDataTables, false));
    (document.getElementById('ReflexAnimationButton')
        .addEventListener('click', reflexAnimation, false));
    (document.getElementById('ResetAnimationButton')
        .addEventListener('click', resetAnimation, false));
    

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

