/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsAnalysis, paramsDesign, layoutAnalysis, layoutDesign, controlsPanel, controls, dataPanel,
        preVoltageDataTable, preCaConcDataTable, postVoltageDataTable, postCaConcDataTable,
        preCurrentDataTable, postCurrentDataTable, tMax = 1000e-3, plotHandles = [], plotFlag; 

    // set up the controls for the current clamp simulation
    paramsAnalysis = { 
        C_pre_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_pre_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_pre_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_pre_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120, minVal: 0, maxVal: 1000 }, 
        E_Na_pre_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_pre_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0, maxVal: 1000 }, 
        E_K_pre_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        g_P_pre_uS: { label: 'P-current conductance', units: '\u00B5S',
            defaultVal: 0.05, minVal: 0, maxVal: 100},
        E_Ca_pre_mV: { label: 'Calcium Nernst potential', units: 'mV',
            defaultVal: 40, minVal: -1000, maxVal: 1000},
        Ca_buff_pre_ms: { label: 'Calcium buffering time constant', units: 'ms',
            defaultVal: 25, minVal: 0.001, maxVal: 1000},

        C_post_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_post_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_post_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_post_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120, minVal: 0, maxVal: 1000 }, 
        E_Na_post_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_post_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0, maxVal: 1000 }, 
        E_K_post_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        g_P_post_uS: { label: 'P-current conductance', units: '\u00B5S',
            defaultVal: 0.05, minVal: 0, maxVal: 100},
        E_Ca_post_mV: { label: 'Calcium Nernst potential', units: 'mV',
            defaultVal: 40, minVal: -1000, maxVal: 1000},
        Ca_buff_post_ms: { label: 'Calcium buffering time constant', units: 'ms',
            defaultVal: 25, minVal: 0.001, maxVal: 1000},

        g_normalized_syn_uS: { label: 'Normalized conductance', units: '\u00B5S', 
            defaultVal: 0.2, minVal: 0, maxVal: 1000 },
        E_rev_syn_mV: { label: 'Reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        tau_r_ms: { label: 'Rise time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },
        tau_d_ms: { label: 'Decay time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },
        Ca_facilitation_nM: { label: 'Calcium facilitation constant', units: 'nM',
            defaultVal: 3, minVal: 0.001, maxVal: 1000 },
        V_thresh_mV: { label: 'Threshold potential', units: 'mV', 
            defaultVal: 2, minVal: -1000, maxVal: 1000 },
        K_p: { label: 'Threshold width', units: 'mV', 
            defaultVal: 5, minVal: 0.1, maxVal: 1000 },

        pulseStart_pre_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseBias_pre_nA: { label: 'Stimulus bias current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseHeight_pre_nA: { label: 'Additional stimulus current during pulse', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_pre_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        isi_pre_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_pre: { label: 'Number of pulses', units: '', 
            defaultVal: 6, minVal: 0, maxVal: 10000 },

        pulseStart_post_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseBias_post_nA: { label: 'Stimulus bias current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseHeight_post_nA: { label: 'Additional stimulus current during pulse', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_post_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        isi_post_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_post: { label: 'Number of pulses', units: '', 
            defaultVal: 0, minVal: 0, maxVal: 10000 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 150, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsDesign = JSON.parse(JSON.stringify(paramsAnalysis));

    paramsAnalysis.E_rev_syn_mV.defaultVal = -77;
    paramsAnalysis.tau_d_ms.defaultVal = 100;

    paramsDesign.E_leak_post_mV.defaultVal = -25;
    paramsDesign.E_rev_syn_mV.defaultVal = -77;
    paramsDesign.Ca_facilitation_nM.defaultVal = 0.1;
    paramsDesign.pulseStart_pre_ms.defaultVal = 150;
    paramsDesign.numPulses_pre.defaultVal = 1;
    paramsDesign.totalDuration_ms.defaultVal = 750;

    layoutAnalysis = [
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 
            'pulseBias_pre_nA', 'pulseHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Postsynaptic Current Clamp', ['pulseStart_post_ms', 
            'pulseBias_post_nA', 'pulseHeight_post_nA', 'pulseWidth_post_ms', 'isi_post_ms', 
            'numPulses_post']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    layoutDesign = [
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 
            'pulseBias_pre_nA', 'pulseHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];

    controlsPanel = document.getElementById('SynapseCurrentClampPlasticControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('SynapseCurrentClampPlasticData');
    dataPanel.className = 'datapanel';

    preVoltageDataTable = document.createElement('table');
    preVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(preVoltageDataTable);

    preCaConcDataTable = document.createElement('table');
    preCaConcDataTable.className = 'datatable';
    dataPanel.appendChild(preCaConcDataTable);

    postVoltageDataTable = document.createElement('table');
    postVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(postVoltageDataTable);

    postCaConcDataTable = document.createElement('table');
    postCaConcDataTable.className = 'datatable';
    dataPanel.appendChild(postCaConcDataTable);

    preCurrentDataTable = document.createElement('table');
    preCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(preCurrentDataTable);

    postCurrentDataTable = document.createElement('table');
    postCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(postCurrentDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, synapse,
            neuron_pre, pulseTrain_pre, hhKCurrent_pre, hhNaCurrent_pre, PCurrent_pre,
            neuron_post, pulseTrain_post, hhKCurrent_post, hhNaCurrent_post, PCurrent_post,
            prerun, result,
            v_pre, v_pre_mV, CaConc_pre, CaConc_pre_nM,
            v_post, v_post_mV, CaConc_post, CaConc_post_nM,
            iStim_pre, iStim_pre_nA, iStim_post, iStim_post_nA,
            params, plot, plotPanel, title, j; 
        
        params = controls.values;
        model = componentModel.componentModel();

        // create the presynaptic passive membrane
        neuron_pre = electrophys.passiveMembrane(model, {
            C: params.C_pre_nF * 1e-9, 
            g_leak: params.g_leak_pre_uS * 1e-6, 
            E_leak: params.E_leak_pre_mV * 1e-3,
            Ca_init: 0,
            K1: 5e8, // uM C^-1
            K2: 1e3 / params.Ca_buff_pre_ms  // s^-1
        });

        pulseTrain_pre = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_pre_ms, 
            width: params.pulseWidth_pre_ms * 1e-3, 
            baseline: params.pulseBias_pre_nA * 1e-9,
            height: params.pulseHeight_pre_nA * 1e-9,
            gap: params.isi_pre_ms * 1e-3,
            num_pulses: params.numPulses_pre
        });
        neuron_pre.addCurrent(pulseTrain_pre);
        
        hhKCurrent_pre = electrophys.hhKConductance(model, neuron_pre, {
            g_K: params.g_K_pre_uS * 1e-6,
            E_K: params.E_K_pre_mV * 1e-3
        });
        
        hhNaCurrent_pre = electrophys.hhNaConductance(model, neuron_pre, {
            g_Na: params.g_Na_pre_uS * 1e-6,
            E_Na: params.E_Na_pre_mV * 1e-3
        });
        
        PCurrent_pre = electrophys.multiConductance.PConductance(model, neuron_pre, {
            g_P: params.g_P_pre_uS * 1e-6,
            E_Ca: params.E_Ca_pre_mV * 1e-3
        });
        
        // create the postsynaptic passive membrane
        neuron_post = electrophys.passiveMembrane(model, {
            C: params.C_post_nF * 1e-9, 
            g_leak: params.g_leak_post_uS * 1e-6, 
            E_leak: params.E_leak_post_mV * 1e-3,
            Ca_init: 0,
            K1: 5e8, // uM C^-1
            K2: 1e3 / params.Ca_buff_post_ms  // s^-1
        });

        pulseTrain_post = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_post_ms, 
            width: params.pulseWidth_post_ms * 1e-3, 
            baseline: params.pulseBias_post_nA * 1e-9,
            height: params.pulseHeight_post_nA * 1e-9,
            gap: params.isi_post_ms * 1e-3,
            num_pulses: params.numPulses_post
        });
        neuron_post.addCurrent(pulseTrain_post);
        
        hhKCurrent_post = electrophys.hhKConductance(model, neuron_post, {
            g_K: params.g_K_post_uS * 1e-6,
            E_K: params.E_K_post_mV * 1e-3
        });
        
        hhNaCurrent_post = electrophys.hhNaConductance(model, neuron_post, {
            g_Na: params.g_Na_post_uS * 1e-6,
            E_Na: params.E_Na_post_mV * 1e-3
        });

        PCurrent_post = electrophys.multiConductance.PConductance(model, neuron_post, {
            g_P: params.g_P_post_uS * 1e-6,
            E_Ca: params.E_Ca_post_mV * 1e-3
        });
        

        // create the synapse
        synapse = electrophys.plasticSynapse(model, neuron_pre, neuron_post, {
            g_normalized: params.g_normalized_syn_uS * 1e-6, 
            Ca_facilitation: params.Ca_facilitation_nM * 1e-3,
            E_rev: params.E_rev_syn_mV * 1e-3,
            a_r: 1 / params.tau_r_ms * 1e3, 
            a_d: 1 / params.tau_d_ms * 1e3, 
            V_T: params.V_thresh_mV * 1e-3,
            K_p: params.K_p * 1e-3
        });

        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -120e-3, 
            tMax: 0, 
            tMaxStep: 1e-4,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-4,
            y0: prerun.y_f
        });
        
        v_pre       = result.mapOrderedPairs(neuron_pre.V);
        CaConc_pre  = result.mapOrderedPairs(neuron_pre.Ca);
        v_post      = result.mapOrderedPairs(neuron_post.V);
        CaConc_post = result.mapOrderedPairs(neuron_post.Ca);
        iStim_pre   = result.mapOrderedPairs(pulseTrain_pre);
        iStim_post  = result.mapOrderedPairs(pulseTrain_post);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_pre_mV       = v_pre.map       (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        CaConc_pre_nM  = CaConc_pre.map  (function (c) {return [c[0] / 1e-3, c[1] / 1e-3];});
        v_post_mV      = v_post.map      (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        CaConc_post_nM = CaConc_post.map (function (c) {return [c[0] / 1e-3, c[1] / 1e-3];});
        iStim_pre_nA   = iStim_pre.map   (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});
        iStim_post_nA  = iStim_post.map  (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('SynapseCurrentClampPlasticPlots');
        plotPanel.innerHTML = '';

        // simulation title
        title = document.createElement('h2');
        if (plotFlag == 'analysis') {
            title.innerHTML = 'Analysis';
        } else if (plotFlag == 'design') {
            title.innerHTML = 'Design';
        } else {
            title.innerHTML = '';
        }
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Pre Voltage
        title = document.createElement('h4');
        title.innerHTML = 'Presynaptic Membrane Potential';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'preVoltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('preVoltagePlot', [v_pre_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#preVoltagePlot', preVoltageDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#preVoltagePlot', 'Time', 'ms', 'mV');

        // Pre Calcium
//        title = document.createElement('h4');
//        title.innerHTML = 'Presynaptic Intracellular Calcium Concentration';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'preCaConcPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('preCaConcPlot', [CaConc_pre_nM], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Calcium Concentration (nM)'},
//                },
//                series: [
//                    {label: '[Ca]', color: 'black'},
//                ],
//        })));
//        graphJqplot.bindDataCapture('#preCaConcPlot', preCaConcDataTable, 'Presynaptic Intracellular Ca Concentration', 'Time');
//        graphJqplot.bindCursorTooltip('#preCaConcPlot', 'Time', 'ms', 'nM');
        
        // Post Voltage
        title = document.createElement('h4');
        title.innerHTML = 'Postsynaptic Membrane Potential';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'postVoltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('postVoltagePlot', [v_post_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#postVoltagePlot', postVoltageDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#postVoltagePlot', 'Time', 'ms', 'mV');

        // Post Calcium
//        title = document.createElement('h4');
//        title.innerHTML = 'Postsynaptic Intracellular Calcium Concentration';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'postCaConcPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('postCaConcPlot', [CaConc_post_nM], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Calcium Concentration (nM)'},
//                },
//                series: [
//                    {label: '[Ca]', color: 'black'},
//                ],
//        })));
//        graphJqplot.bindDataCapture('#postCaConcPlot', postCaConcDataTable, 'Postsynaptic Intracellular Ca Concentration', 'Time');
//        graphJqplot.bindCursorTooltip('#postCaConcPlot', 'Time', 'ms', 'nM');
        
        // Pre Current
        title = document.createElement('h4');
        title.innerHTML = 'Presynaptic Stimulation Current';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'preCurrentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('preCurrentPlot', [iStim_pre_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#preCurrentPlot', preCurrentDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#preCurrentPlot', 'Time', 'ms', 'nA');

        // Post Current
        if (plotFlag != "design") {
            title = document.createElement('h4');
            title.innerHTML = 'Postsynaptic Stimulation Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'postCurrentPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('postCurrentPlot', [iStim_post_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#postCurrentPlot', postCurrentDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#postCurrentPlot', 'Time', 'ms', 'nA');
        }
    }


    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function resetToAnalysis() {
        plotFlag = 'analysis';
        reset(paramsAnalysis, layoutAnalysis);
    }


    function resetToDesign() {
        plotFlag = 'design';
        reset(paramsDesign, layoutDesign);
    }


    function clearDataTables() {
        preVoltageDataTable.innerHTML = '';
        preVoltageDataTable.style.display = 'none';

        preCaConcDataTable.innerHTML = '';
        preCaConcDataTable.style.display = 'none';

        postVoltageDataTable.innerHTML = '';
        postVoltageDataTable.style.display = 'none';

        postCaConcDataTable.innerHTML = '';
        postCaConcDataTable.style.display = 'none';

        preCurrentDataTable.innerHTML = '';
        preCurrentDataTable.style.display = 'none';

        postCurrentDataTable.innerHTML = '';
        postCurrentDataTable.style.display = 'none';
    }


    (document.getElementById('SynapseCurrentClampPlasticRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SynapseCurrentClampPlasticClearDataButton')
        .addEventListener('click', clearDataTables, false));
    (document.getElementById('SynapseCurrentClampPlasticAnalysisButton')
        .addEventListener('click', resetToAnalysis, false));
    (document.getElementById('SynapseCurrentClampPlasticDesignButton')
        .addEventListener('click', resetToDesign, false));
    

    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    resetToAnalysis();
    clearDataTables();

}, false);

