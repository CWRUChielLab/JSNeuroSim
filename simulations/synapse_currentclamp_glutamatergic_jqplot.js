/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, preVoltageDataTable,
        preCaConcDataTable, postVoltageDataTable, postCaConcDataTable, preCurrentDataTable,
        tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    params = { 
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

        // AMPA and NMDA time constants based on Destexhe A, Mainen ZF and
        // Sejnowski TJ, Synthesis of models for excitable membranes, synaptic
        // transmission and neuromodulation using a common kinetic formalism,
        // J Comp Neuro 1: 195-230, 1994, Table 1.
        g_AMPA_uS: { label: 'AMPA maximum conductance', units: '\u00B5S', 
            defaultVal: 0.2, minVal: 0, maxVal: 1000 },
        E_rev_AMPA_mV: { label: 'AMPA reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        alpha_AMPA_ms: { label: 'AMPA rise time constant', units: 'ms mM', 
            defaultVal: 0.909, minVal: 0.1, maxVal: 1000 },
        beta_AMPA_ms: { label: 'AMPA decay time constant', units: 'ms', 
            defaultVal: 5.263, minVal: 0.1, maxVal: 1000 },
        g_NMDA_uS: { label: 'NMDA maximum conductance', units: '\u00B5S', 
            defaultVal: 0.2, minVal: 0, maxVal: 1000 },
        E_rev_NMDA_mV: { label: 'NMDA reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        alpha_NMDA_ms: { label: 'NMDA rise time constant', units: 'ms mM', 
            defaultVal: 13.889, minVal: 0.1, maxVal: 1000 },
        beta_NMDA_ms: { label: 'NMDA decay time constant', units: 'ms', 
            defaultVal: 151.515, minVal: 0.1, maxVal: 1000 },
        Mg_mM: { label: 'Extracellular magnesium concentration', units: 'mM',
            defaultVal: 1, minVal: 0, maxVal: 10000 },
        threshold_syn_mV: { label: 'Threshold potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },

        pulseStart_pre_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_pre_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_pre_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        isi_pre_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_pre: { label: 'Number of pulses', units: '', 
            defaultVal: 6, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 150, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Presynaptic Cell Properties', ['C_pre_nF', 'g_leak_pre_uS', 
            'E_leak_pre_mV', 'g_Na_pre_uS', 'E_Na_pre_mV', 'g_K_pre_uS', 
            'E_K_pre_mV', 'g_P_pre_uS', 'E_Ca_pre_mV', 'Ca_buff_pre_ms']],
        ['Postsynaptic Cell Properties', ['C_post_nF', 'g_leak_post_uS', 
            'E_leak_post_mV', 'g_Na_post_uS', 'E_Na_post_mV', 'g_K_post_uS', 
            'E_K_post_mV', 'g_P_post_uS', 'E_Ca_post_mV', 'Ca_buff_post_ms']],
        ['Synapse properties', ['g_AMPA_uS', 'E_rev_AMPA_mV', 'alpha_AMPA_ms',
            'beta_AMPA_ms', 'g_NMDA_uS', 'E_rev_NMDA_mV', 'alpha_NMDA_ms',
            'beta_NMDA_ms', 'Mg_mM', 'threshold_syn_mV']],
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 
            'pulseHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('SynapseCurrentClampGlutamatergicControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('SynapseCurrentClampGlutamatergicData');
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

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, AMPASynapse, NMDASynapse,
            neuron_pre, pulseTrain_pre, hhKCurrent_pre, hhNaCurrent_pre, PCurrent_pre,
            neuron_post, hhKCurrent_post, hhNaCurrent_post, PCurrent_post,
            prerun, result,
            v_pre, v_pre_mV, CaConc_pre, CaConc_pre_nM,
            NMDAr, NMDAtransmitter, NMDAcurrent, mGate, hGate, nGate,
            v_post, v_post_mV, CaConc_post, CaConc_post_nM,
            iStim_pre, iStim_pre_nA, 
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
        

        // create the AMPA receptor-mediated current
        AMPASynapse = electrophys.simpleDiscreteEventSynapse(model, neuron_pre, neuron_post, {
            g_bar: params.g_AMPA_uS * 1e-6, 
            E_rev: params.E_rev_AMPA_mV * 1e-3,
            alpha: 1 / params.alpha_AMPA_ms * 1e3, 
            beta: 1 / params.beta_AMPA_ms * 1e3, 
            transmitter_max: 1, // mM
            threshold: params.threshold_syn_mV * 1e-3,
            duration: 0.001 // s
        });

        // create the NMDA receptor-mediated current
        NMDASynapse = electrophys.NMDASynapse(model, neuron_pre, neuron_post, {
            g_bar: params.g_NMDA_uS * 1e-6, 
            E_rev: params.E_rev_NMDA_mV * 1e-3,
            alpha: 1 / params.alpha_NMDA_ms * 1e3, 
            beta: 1 / params.beta_NMDA_ms * 1e3, 
            transmitter_max: 1, // mM
            threshold: params.threshold_syn_mV * 1e-3,
            duration: 0.001, // s
            Mg: params.Mg_mM
        });

        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -150e-3, 
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
        NMDAr       = result.mapOrderedPairs(NMDASynapse.r);
        NMDAtransmitter = result.mapOrderedPairs(NMDASynapse.transmitter);
        NMDAcurrent = result.mapOrderedPairs(NMDASynapse.current);
        mGate = result.mapOrderedPairs(hhNaCurrent_post.m);
        hGate = result.mapOrderedPairs(hhNaCurrent_post.h);
        nGate = result.mapOrderedPairs(hhKCurrent_post.n);
        v_post      = result.mapOrderedPairs(neuron_post.V);
        CaConc_post = result.mapOrderedPairs(neuron_post.Ca);
        iStim_pre   = result.mapOrderedPairs(pulseTrain_pre);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_pre_mV       = v_pre.map       (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        CaConc_pre_nM  = CaConc_pre.map  (function (c) {return [c[0] / 1e-3, c[1] / 1e-3];});
        NMDAr          = NMDAr.map       (function (r) {return [r[0] / 1e-3, r[1]       ];});
        NMDAtransmitter    = NMDAtransmitter.map (function (t) {return [t[0] / 1e-3, t[1]       ];});
        NMDAcurrent    = NMDAcurrent.map (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        mGate    = mGate.map (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate    = hGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        nGate    = nGate.map (function (n) {return [n[0] / 1e-3,  n[1]       ];});
        v_post_mV      = v_post.map      (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        CaConc_post_nM = CaConc_post.map (function (c) {return [c[0] / 1e-3, c[1] / 1e-3];});
        iStim_pre_nA   = iStim_pre.map   (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('SynapseCurrentClampGlutamatergicPlots');
        plotPanel.innerHTML = '';

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
        title = document.createElement('h4');
        title.innerHTML = 'Presynaptic Intracellular Calcium Concentration';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'preCaConcPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('preCaConcPlot', [CaConc_pre_nM], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Calcium Concentration (nM)'},
                },
                series: [
                    {label: '[Ca]', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#preCaConcPlot', preCaConcDataTable, 'Presynaptic Intracellular Ca Concentration', 'Time');
        graphJqplot.bindCursorTooltip('#preCaConcPlot', 'Time', 'ms', 'nM');
        
        // NMDA r
        title = document.createElement('h4');
        title.innerHTML = 'NMDA r';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'NMDArPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('NMDArPlot', [NMDAr], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'r',
                        min: 0, max: 1,
                        numberTicks: 6,
                    },
                },
                series: [
                    {label: 'r<sub>NMDA</sub>', color: 'black'},
                ],
        })));

        // NMDA transmitter
        title = document.createElement('h4');
        title.innerHTML = 'NMDA transmitter';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'NMDAtransmitterPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('NMDAtransmitterPlot', [NMDAtransmitter], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Transmitter (mM)'},
                },
                series: [
                    {label: 'NMDA Transmitter', color: 'black'},
                ],
        })));

        // NMDA current
        title = document.createElement('h4');
        title.innerHTML = 'NMDA current';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'NMDAcurrentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('NMDAcurrentPlot', [NMDAcurrent], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>NMDA</sub>', color: 'black'},
                ],
        })));

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

        // Post Gates
        title = document.createElement('h4');
        title.innerHTML = 'Postsynaptic Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'gatePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlot', [mGate, hGate, nGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'm', color: 'blue'},
                    {label: 'h', color: 'purple'},
                    {label: 'n', color: 'red'},
                ],
        })));
        graphJqplot.bindCursorTooltip('#gatePlot', 'Time', 'ms', '');

        // Post Calcium
        title = document.createElement('h4');
        title.innerHTML = 'Postsynaptic Intracellular Calcium Concentration';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'postCaConcPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('postCaConcPlot', [CaConc_post_nM], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Calcium Concentration (nM)'},
                },
                series: [
                    {label: '[Ca]', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#postCaConcPlot', postCaConcDataTable, 'Postsynaptic Intracellular Ca Concentration', 'Time');
        graphJqplot.bindCursorTooltip('#postCaConcPlot', 'Time', 'ms', 'nM');
        
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
    }


    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
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
    }


    (document.getElementById('SynapseCurrentClampGlutamatergicRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SynapseCurrentClampGlutamatergicResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('SynapseCurrentClampGlutamatergicClearDataButton')
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

    reset();
    clearDataTables();

}, false);

