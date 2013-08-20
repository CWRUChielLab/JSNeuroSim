/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsMerkel, paramsMeissner, paramsBoth, layoutMerkel, layoutMeissner, layoutBoth,
        controlsPanel, controls, dataPanel, 
        merkelVoltageDataTable, meissnerVoltageDataTable,
        touchDataTable, merkelCurrentDataTable, meissnerCurrentDataTable,
        tMax = 600000e-3, 
        simType = 'merkel',
        plotHandles = [];

    // set up the controls for the passive membrane simulation
    paramsBoth = { 
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
            defaultVal: 8, minVal: 0, maxVal: 20},
        midpointUp2_ms: { label: 'Stimulus start', units: 'ms',
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3},
        midpointDown2_ms: { label: 'Stimulus end', units: 'ms',
            defaultVal: 400, minVal: 0, maxVal: tMax / 1e-3},
        growthRateUp2_ms: { label: 'Applied pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
        growthRateDown2_ms: { label: 'Removed pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
            
        sigHeight3_mN: { label: 'Maximum pressure', units: 'mN',
            defaultVal: 8, minVal: 0, maxVal: 20},
        midpointUp3_ms: { label: 'Stimulus start', units: 'ms',
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3},
        midpointDown3_ms: { label: 'Stimulus end', units: 'ms',
            defaultVal: 600, minVal: 0, maxVal: tMax / 1e-3},
        growthRateUp3_ms: { label: 'Applied pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
        growthRateDown3_ms: { label: 'Removed pressure time constant', units: 'ms',
            defaultVal: 4, minVal: 0, maxVal: 300},
            
        merkel_Ks: { label: 'Static gain', units: 'nA/mN',
            defaultVal: 0.2, minVal: 0, maxVal: 100},
        merkel_Kd_positive: { label: 'Positive dynamic gain', units: 'pC/mN',
            defaultVal: 14, minVal: 0, maxVal: 10000},
        merkel_Kd_negative: { label: 'Negative dynamic gain', units: 'pC/mN',
            defaultVal: 0, minVal: -10000, maxVal: 10000},
            
        meissner_Ks: { label: 'Static gain', units: 'nA/mN',
            defaultVal: 0, minVal: 0, maxVal: 100},
        meissner_Kd_positive: { label: 'Positive dynamic gain', units: 'pC/mN',
            defaultVal: 16, minVal: 0, maxVal: 10000},
        meissner_Kd_negative: { label: 'Negative dynamic gain', units: 'pC/mN',
            defaultVal: -16, minVal: -10000, maxVal: 10000},
            
        merkel_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        merkel_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        merkel_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        merkel_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
            
        meissner_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        meissner_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        meissner_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        meissner_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
            
        merkel_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        merkel_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        merkel_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
        
        meissner_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        meissner_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        meissner_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
            
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 700, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsMerkel = JSON.parse(JSON.stringify(paramsBoth));
    paramsMerkel.sigHeight2_mN.defaultVal = 0;
    paramsMerkel.sigHeight3_mN.defaultVal = 0;
    paramsMerkel.midpointDown1_ms.defaultVal = 400;

    paramsMeissner = JSON.parse(JSON.stringify(paramsBoth));
    paramsMeissner.sigHeight2_mN.defaultVal = 0;
    paramsMeissner.sigHeight3_mN.defaultVal = 0;
    paramsMeissner.midpointDown1_ms.defaultVal = 400;

    layoutMerkel = [
        ['Merkel Cell Properties', ['merkel_V_init_mV', 'merkel_C_nF', 'merkel_g_leak_uS', 'merkel_E_leak_mV',
            'merkel_theta_ss_mV', 'merkel_theta_r_mV', 'merkel_theta_tau_ms']],
        ['Touch Stimulus Properties', ['sigHeight1_mN', 'midpointUp1_ms', 'midpointDown1_ms', 'growthRateUp1_ms', 'growthRateDown1_ms']],
        ['Simulation Settings', ['totalDuration_ms']],
    ];
    
    layoutMeissner = [
        ['Meissner Corpuscle Properties', ['meissner_V_init_mV', 'meissner_C_nF', 'meissner_g_leak_uS', 'meissner_E_leak_mV',
            'meissner_theta_ss_mV', 'meissner_theta_r_mV', 'meissner_theta_tau_ms']],
        ['Touch Stimulus Properties', ['sigHeight1_mN', 'midpointUp1_ms', 'midpointDown1_ms', 'growthRateUp1_ms', 'growthRateDown1_ms']],
        ['Simulation Settings', ['totalDuration_ms']],
    ];
    
    layoutBoth = [
        ['Merkel Cell Properties', ['merkel_V_init_mV', 'merkel_C_nF', 'merkel_g_leak_uS', 'merkel_E_leak_mV',
            'merkel_theta_ss_mV', 'merkel_theta_r_mV', 'merkel_theta_tau_ms']],
        ['Meissner Corpuscle Properties', ['meissner_V_init_mV', 'meissner_C_nF', 'meissner_g_leak_uS', 'meissner_E_leak_mV',
            'meissner_theta_ss_mV', 'meissner_theta_r_mV', 'meissner_theta_tau_ms']],
        ['First Touch Stimulus Properties', ['sigHeight1_mN', 'midpointUp1_ms', 'midpointDown1_ms', 'growthRateUp1_ms', 'growthRateDown1_ms']],
        ['Second Touch Stimulus Properties', ['sigHeight2_mN', 'midpointUp2_ms', 'midpointDown2_ms', 'growthRateUp2_ms', 'growthRateDown2_ms']],
        ['Third Touch Stimulus Properties', ['sigHeight3_mN', 'midpointUp3_ms', 'midpointDown3_ms', 'growthRateUp3_ms', 'growthRateDown3_ms']],
        ['Merkel Cell Current Properties', ['merkel_Ks', 'merkel_Kd_positive', 'merkel_Kd_negative']],
        ['Meissner Corpuscle Current Properties', ['meissner_Ks', 'meissner_Kd_positive', 'meissner_Kd_negative']],
        ['Simulation Settings', ['totalDuration_ms']],
    ];

    controlsPanel = document.getElementById('MechanoreceptorControls');

    
    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MechanoreceptorData');
    dataPanel.className = 'datapanel';

    merkelVoltageDataTable = document.createElement('table');
    merkelVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(merkelVoltageDataTable);
    
    meissnerVoltageDataTable = document.createElement('table');
    meissnerVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(meissnerVoltageDataTable);
    
    touchDataTable = document.createElement('table');
    touchDataTable.className = 'datatable';
    dataPanel.appendChild(touchDataTable);

    merkelCurrentDataTable = document.createElement('table');
    merkelCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(merkelCurrentDataTable);
    
    meissnerCurrentDataTable = document.createElement('table');
    meissnerCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(meissnerCurrentDataTable);


    function runSimulation() {
        var params, plot, plotPanel, title, model,
            merkelCell, merkelTouchCurrent,
            meissnerCorpuscle, meissnerTouchCurrent,
            merkel_v, merkel_v_mV, 
            meissner_v, meissner_v_mV,
            merkel_iStim, merkel_iStim_nA, 
            meissner_iStim, meissner_iStim_nA,
            touchStim, touchStim_mN,
            result;
       
        params = controls.values;
        model = componentModel.componentModel();
        
        // Create the merkel cell and current
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
        
        // Create the meissner corpuscle and current    
        meissnerCorpuscle = electrophys.gettingIFNeuron(model, { 
            V_rest: params.meissner_V_init_mV * 1e-3, 
            C: params.meissner_C_nF * 1e-9, 
            g_leak: params.meissner_g_leak_uS * 1e-6, 
            E_leak: params.meissner_E_leak_mV * 1e-3, 
            theta_ss: params.meissner_theta_ss_mV * 1e-3, 
            theta_r: params.meissner_theta_r_mV * 1e-3, 
            theta_tau: params.meissner_theta_tau_ms * 1e-3

        });
        
        meissnerTouchCurrent = electrophys.touchStimuli({
            Ks: params.meissner_Ks * 1e-6, // A/N
            Kd_positive: params.meissner_Kd_positive * 1e-9, // C/N
            Kd_negative: params.meissner_Kd_negative * 1e-9, // C/N
            
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
        
        meissnerCorpuscle.addCurrent(meissnerTouchCurrent.pulse);
        
        
        // run for a bit to allow the simulation to stabilize
        result = model.integrate({
            tMin: -1.5, 
            tMax: 0, 
            tMaxStep: 16e-3,
        });
        
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(16e-3, 
                params.totalDuration_ms * 1e-3 / 500),
            y0: result.y_f
        });
        

        merkel_v       = result.mapOrderedPairs(merkelCell.VWithSpikes);
        meissner_v     = result.mapOrderedPairs(meissnerCorpuscle.VWithSpikes);
        touchStim      = result.mapOrderedPairs(merkelTouchCurrent.force);
        merkel_iStim   = result.mapOrderedPairs(merkelTouchCurrent.pulse);
        meissner_iStim = result.mapOrderedPairs(meissnerTouchCurrent.pulse);
        
        // convert to the right units
        // each ordered pair consists of a time and another variable
        merkel_v_mV       = merkel_v.map       (function (v) {return [v[0] / 1e-3, v[1] / 1e-3]});
        meissner_v_mV     = meissner_v.map     (function (v) {return [v[0] / 1e-3, v[1] / 1e-3]});
        touchStim_mN      = touchStim.map      (function (f) {return [f[0] / 1e-3, f[1] / 1e-3]});
        merkel_iStim_nA   = merkel_iStim.map   (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});
        meissner_iStim_nA = meissner_iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});
        
        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('MechanoreceptorPlots');
        plotPanel.innerHTML = '';
        
        // Merkel cell voltage
        if (simType != 'meissner') {
            title = document.createElement('h4');
            title.innerHTML = 'Merkel Cell Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'merkelVoltagePlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('merkelVoltagePlot', [merkel_v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#merkelVoltagePlot', merkelVoltageDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#merkelVoltagePlot', 'Time', 'ms', 'mV');
        }
        
        // Meissner corpuscle voltage
        if (simType != 'merkel') {
            title = document.createElement('h4');
            title.innerHTML = 'Meissner Corpuscle Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'meissnerVoltagePlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('meissnerVoltagePlot', [meissner_v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#meissnerVoltagePlot', meissnerVoltageDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#meissnerVoltagePlot', 'Time', 'ms', 'mV');
        }
        
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
           $.jqplot('touchStimPlot', [touchStim_mN], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Touch force (mN)'},
                },
                series: [
                    {label: 'Touch force', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#touchStimPlot', touchDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'mN');
        
        // Merkel cell current
        if (simType == 'both') {
            title = document.createElement('h4');
            title.innerHTML = 'Merkel Cell Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'merkelCurrentPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('merkelCurrentPlot', [merkel_iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#merkelCurrentPlot', merkelCurrentDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#merkelCurrentPlot', 'Time', 'ms', 'nA');
        }
        
        // Meissner corpuscle current
        if (simType == 'both') {
            title = document.createElement('h4');
            title.innerHTML = 'Meissner Corpuscle Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'meissnerCurrentPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('meissnerCurrentPlot', [meissner_iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#meissnerCurrentPlot', meissnerCurrentDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#meissnerCurrentPlot', 'Time', 'ms', 'nA');
        }
    }

   
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }   
    
    function resetToMerkel() {
        simType = 'merkel';
        reset(paramsMerkel, layoutMerkel);
    }
    
    function resetToMeissner() {
        simType = 'meissner';
        reset(paramsMeissner, layoutMeissner);
    }
    
    function resetToBoth() {
        simType = 'both';
        reset(paramsBoth, layoutBoth);
    }
    

    function clearDataTables() {
        merkelVoltageDataTable.innerHTML = '';
        merkelVoltageDataTable.style.display = 'none';
        
        meissnerVoltageDataTable.innerHTML = '';
        meissnerVoltageDataTable.style.display = 'none';
        
        touchDataTable.innerHTML = '';
        touchDataTable.style.display = 'none';

        merkelCurrentDataTable.innerHTML = '';
        merkelCurrentDataTable.style.display = 'none';
        
        meissnerCurrentDataTable.innerHTML = '';
        meissnerCurrentDataTable.style.display = 'none';
    }


    (document.getElementById('MechanoreceptorRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MerkelCellButton')
        .addEventListener('click', resetToMerkel, false));
    (document.getElementById('MeissnerCorpuscleButton')
        .addEventListener('click', resetToMeissner, false));
    (document.getElementById('BothMechanoreceptorsButton')
        .addEventListener('click', resetToBoth, false));        
    (document.getElementById('MechanoreceptorClearDataButton')
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

    resetToBoth();
    clearDataTables();

}, false);

