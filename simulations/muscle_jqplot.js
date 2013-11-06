/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsRecruitmentAndSummation, paramsRecruitmentOnly,
        layout, controlsPanel, controls, dataPanel, lengthDataTable,
        forceDataTable, voltageDataTable, touchStimDataTable,
        tMax = 3000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    paramsRecruitmentAndSummation = {
        activation_tau: { label: 'Activation time constant', units: 'ms',
            defaultVal: 150, minVal: 0.1, maxVal: 1000.0},
        T0_ms: { label: 'Base firing period', units: 'ms',
            defaultVal: 120, minVal: 0, maxVal: 500 },
        Tslope_ms: { label: 'Firing period slope', units: 'ms',
            defaultVal: 50, minVal: -100, maxVal: 100 },
        Lrestspring: { label: 'Spring resting position', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        k: { label: 'Spring stiffness', units: 'N/cm',
            defaultVal: 0.01, minVal: 0, maxVal: 10.0 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 },

        merkel_Ks: { label: 'Static gain', units: 'nA/mN',
            defaultVal: 0.2, minVal: 0, maxVal: 100},
        merkel_Kd_positive: { label: 'Positive dynamic gain', units: 'pC/mN',
            defaultVal: 14, minVal: 0, maxVal: 10000},
        merkel_Kd_negative: { label: 'Negative dynamic gain', units: 'pC/mN',
            defaultVal: 0, minVal: -10000, maxVal: 10000},
            
        merkel_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        merkel_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        merkel_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        merkel_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
            
        merkel_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        merkel_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        merkel_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },

        sigHeight1_mN: { label: 'Maximum pressure', units: 'mN',
            defaultVal: 8, minVal: 0, maxVal: 20},
        midpointUp1_ms: { label: 'Stimulus start', units: 'ms',
            defaultVal: 50, minVal: 0, maxVal: tMax / 1e-3},
        midpointDown1_ms: { label: 'Stimulus end', units: 'ms',
            defaultVal: 200, minVal: 0, maxVal: tMax / 1e-3},
        growthRateUp1_ms: { label: 'Applied pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
        growthRateDown1_ms: { label: 'Removed pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
            
        sigHeight2_mN: { label: 'Maximum pressure', units: 'mN',
            defaultVal: 0, minVal: 0, maxVal: 20},
        midpointUp2_ms: { label: 'Stimulus start', units: 'ms',
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3},
        midpointDown2_ms: { label: 'Stimulus end', units: 'ms',
            defaultVal: 400, minVal: 0, maxVal: tMax / 1e-3},
        growthRateUp2_ms: { label: 'Applied pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
        growthRateDown2_ms: { label: 'Removed pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
            
        sigHeight3_mN: { label: 'Maximum pressure', units: 'mN',
            defaultVal: 0, minVal: 0, maxVal: 20},
        midpointUp3_ms: { label: 'Stimulus start', units: 'ms',
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3},
        midpointDown3_ms: { label: 'Stimulus end', units: 'ms',
            defaultVal: 600, minVal: 0, maxVal: tMax / 1e-3},
        growthRateUp3_ms: { label: 'Applied pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
        growthRateDown3_ms: { label: 'Removed pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300}
    };

    paramsRecruitmentOnly = JSON.parse(JSON.stringify(paramsRecruitmentAndSummation));
    paramsRecruitmentOnly.T0_ms.defaultVal = 80;
    paramsRecruitmentOnly.Tslope_ms.defaultVal = 0;

    layout = [
        ['Muscle Properties', ['activation_tau']],
        ['Spring Properties', ['Lrestspring', 'k']],
        ['First Touch Stimulus Properties', ['sigHeight1_mN', 'midpointUp1_ms', 'midpointDown1_ms', 'growthRateUp1_ms', 'growthRateDown1_ms']],
        ['Second Touch Stimulus Properties', ['sigHeight2_mN', 'midpointUp2_ms', 'midpointDown2_ms', 'growthRateUp2_ms', 'growthRateDown2_ms']],
        ['Third Touch Stimulus Properties', ['sigHeight3_mN', 'midpointUp3_ms', 'midpointDown3_ms', 'growthRateUp3_ms', 'growthRateDown3_ms']],
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

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);

    touchStimDataTable = document.createElement('table');
    touchStimDataTable.className = 'datatable';
    dataPanel.appendChild(touchStimDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, merkelCell, merkelTouchCurrent, muscle,
            prerun, result, L, force, V, touchStim,
            plotPanel, title, plot; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        merkelCell = electrophys.gettingIFNeuron(model, { 
            V_rest: params.merkel_V_init_mV * 1e-3, 
            C: params.merkel_C_nF * 1e-9, 
            g_leak: params.merkel_g_leak_uS * 1e-6, 
            E_leak: params.merkel_E_leak_mV * 1e-3, 
            theta_ss: params.merkel_theta_ss_mV * 1e-3, 
            theta_r: params.merkel_theta_r_mV * 1e-3, 
            theta_tau: params.merkel_theta_tau_ms * 1e-3
        });

        merkelTouchCurrent = electrophys.touchStimuli({
            Ks: params.merkel_Ks * 1e-6, // A/N
            Kd_positive: params.merkel_Kd_positive * 1e-9, // C/N
            Kd_negative: params.merkel_Kd_negative * 1e-9, // C/N
            
            sigHeight1: params.sigHeight1_mN * 1e-3,
            midpointUp1: params.midpointUp1_ms * 1e-3,
            midpointDown1: params.midpointDown1_ms * 1e-3,
            growthRateUp1: params.growthRateUp1_ms * 1e-3,
            growthRateDown1: params.growthRateDown1_ms * 1e-3,
            
            sigHeight2: params.sigHeight2_mN * 1e-3,
            midpointUp2: params.midpointUp2_ms * 1e-3,
            midpointDown2: params.midpointDown2_ms * 1e-3,
            growthRateUp2: params.growthRateUp2_ms * 1e-3,
            growthRateDown2: params.growthRateDown2_ms * 1e-3,
            
            sigHeight3: params.sigHeight3_mN * 1e-3,
            midpointUp3: params.midpointUp3_ms * 1e-3,
            midpointDown3: params.midpointDown3_ms * 1e-3,
            growthRateUp3: params.growthRateUp3_ms * 1e-3,
            growthRateDown3: params.growthRateDown3_ms * 1e-3
        });

        merkelCell.addCurrent(merkelTouchCurrent.pulse);
        
        muscle = electrophys.muscle(model, {
            neuralInput: function (state, t) { return 2 * (0.050 + merkelCell.VWithSpikes(state, t)); },
            T0: params.T0_ms * 1e-3,
            Tslope: params.Tslope_ms * 1e-3,
            Lrestspring: params.Lrestspring,
            k: params.k,
            p: 1 / params.activation_tau * 1e3
        });
        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -500e-3, 
            tMax: 0, 
            tMaxStep: 1e-3,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-3,
            y0: prerun.y_f
        });
        
        L      = result.mapOrderedPairs(muscle.L);
        force  = result.mapOrderedPairs(muscle.force);
        V      = result.mapOrderedPairs(merkelCell.VWithSpikes);
        touchStim = result.mapOrderedPairs(merkelTouchCurrent.force);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        L      = L.map      (function (l) {return [l[0] / 1e-3, l[1]       ];});
        force  = force.map  (function (f) {return [f[0] / 1e-3, f[1] / 1e-3];});
        V      = V.map      (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        touchStim = touchStim.map (function (f) {return [f[0] / 1e-3, f[1] / 1e-3]});

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
        // MECHANORECEPTOR
        // ******************

        // Neuron membrane potential
        title = document.createElement('h4');
        title.innerHTML = 'Mechanoreceptor';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('voltagePlot', [V], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#voltagePlot', voltageDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#voltagePlot', 'Time', 'ms', 'mV');

        // Touch stimuli
        title = document.createElement('h4');
        title.innerHTML = 'Touch Stimulus';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'touchStimPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('touchStimPlot', [touchStim], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Touch force (mN)'},
                },
                series: [
                    {label: 'Touch force', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#touchStimPlot', touchStimDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'mN');
    }

    
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function resetToRecruitmentAndSummationSim() {
        reset(paramsRecruitmentAndSummation, layout);
    }


    function resetToRecruitmentOnlySim() {
        reset(paramsRecruitmentOnly, layout);
    }


    function clearDataTables() {
        lengthDataTable.innerHTML = '';
        lengthDataTable.style.display = 'none';

        forceDataTable.innerHTML = '';
        forceDataTable.style.display = 'none';

        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';

        touchStimDataTable.innerHTML = '';
        touchStimDataTable.style.display = 'none';
    }


    (document.getElementById('MuscleRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MuscleRecruitmentAndSummationSimButton')
        .addEventListener('click', resetToRecruitmentAndSummationSim, false));
    (document.getElementById('MuscleRecruitmentOnlySimButton')
        .addEventListener('click', resetToRecruitmentOnlySim, false));
    (document.getElementById('MuscleClearDataButton')
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

    resetToRecruitmentAndSummationSim();
    clearDataTables();

}, false);

