/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsDefaultSim, paramsLTPSim, layout, controlsPanel, controls, dataPanel,
        preVoltageDataTable, postVoltageDataTable, preCurrentDataTable, postCurrentDataTable,
        preCaConcDataTable, postCaConcDataTable, AMPACurrentDataTable,
        tMax = 1000e-3, plotHandles = [], plotFlag = ''; 

    // set up the controls for the current clamp simulation
    paramsDefaultSim = { 
        C_pre_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_pre_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_pre_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_pre_uS: { label: 'Fast transient sodium conductance', units: '\u00B5S',
            defaultVal: 120, minVal: 0, maxVal: 1000 }, 
        E_Na_pre_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_pre_uS: { label: 'Delayed rectifier potassium conductance', units: '\u00B5S',
            defaultVal: 36, minVal: 0, maxVal: 1000 }, 
        E_K_pre_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        g_P_pre_uS: { label: 'P-current conductance', units: '\u00B5S',
            defaultVal: 0, minVal: 0, maxVal: 100},
        E_Ca_pre_mV: { label: 'Calcium Nernst potential', units: 'mV',
            defaultVal: 40, minVal: -1000, maxVal: 1000},
        Ca_buff_pre_ms: { label: 'Calcium buffering time constant', units: 'ms',
            defaultVal: 25, minVal: 0.001, maxVal: 1000},

        C_post_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 2, minVal: 0.01, maxVal: 100 }, 
        g_leak_post_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.6, minVal: 0.001, maxVal: 100 }, 
        E_leak_post_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -70, minVal: -1000, maxVal: 1000 }, 
        g_Na_post_uS: { label: 'Fast transient sodium conductance', units: '\u00B5S',
            defaultVal: 260, minVal: 0, maxVal: 1000 }, 
        E_Na_post_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_post_uS: { label: 'Delayed rectifier potassium conductance', units: '\u00B5S',
            defaultVal: 50, minVal: 0, maxVal: 1000 }, 
        E_K_post_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        g_P_post_uS: { label: 'P-current conductance', units: '\u00B5S',
            defaultVal: 0, minVal: 0, maxVal: 100},
        E_Ca_post_mV: { label: 'Calcium Nernst potential', units: 'mV',
            defaultVal: 40, minVal: -1000, maxVal: 1000},
        Ca_buff_post_ms: { label: 'Calcium buffering time constant', units: 'ms',
            defaultVal: 25, minVal: 0.001, maxVal: 1000},

        // AMPA and NMDA time constants based on Destexhe A, Mainen ZF and
        // Sejnowski TJ, Synthesis of models for excitable membranes, synaptic
        // transmission and neuromodulation using a common kinetic formalism,
        // J Comp Neuro 1: 195-230, 1994, Table 1.
        g_AMPA_max_uS: { label: 'AMPA maximum conductance', units: '\u00B5S', 
            defaultVal: 4, minVal: 0, maxVal: 1000 },
        g_AMPA_min_uS: { label: 'AMPA minimum conductance', units: '\u00B5S', 
            defaultVal: 0.5, minVal: 0, maxVal: 1000 },
        E_rev_AMPA_mV: { label: 'AMPA reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        alpha_AMPA_ms: { label: 'AMPA rise time constant', units: 'ms mM', 
            defaultVal: 0.909, minVal: 0.1, maxVal: 1000 },
        beta_AMPA_ms: { label: 'AMPA decay time constant', units: 'ms', 
            defaultVal: 5.263, minVal: 0.1, maxVal: 1000 },
        g_NMDA_uS: { label: 'NMDA maximum conductance', units: '\u00B5S', 
            defaultVal: 6, minVal: 0, maxVal: 1000 },
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
        pulseHeight_pre_nA: { label: 'Stimulus current first pulse', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseSubsequentHeight_pre_nA: { label: 'Stimulus current subsequent pulses', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_pre_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        isi_pre_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_pre: { label: 'Number of pulses', units: '', 
            defaultVal: 6, minVal: 0, maxVal: 100 },

        pulseStart_post_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_post_nA: { label: 'Stimulus current first pulse', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseSubsequentHeight_post_nA: { label: 'Stimulus current subsequent pulses', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_post_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        isi_post_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_post: { label: 'Number of pulses', units: '', 
            defaultVal: 0, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 150, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsLTPSim = JSON.parse(JSON.stringify(paramsDefaultSim));
    paramsLTPSim.Ca_buff_post_ms.defaultVal = 200;
    paramsLTPSim.g_AMPA_max_uS.defaultVal = 6;
    paramsLTPSim.g_AMPA_min_uS.defaultVal = 0.15;
    paramsLTPSim.g_NMDA_uS.defaultVal = 2;
    paramsLTPSim.E_rev_NMDA_mV.defaultVal = 25;
    paramsLTPSim.pulseStart_pre_ms.defaultVal = 0;
    paramsLTPSim.pulseHeight_pre_nA.defaultVal = 6;
    paramsLTPSim.pulseSubsequentHeight_pre_nA.defaultVal = 6;
    paramsLTPSim.pulseWidth_pre_ms.defaultVal = 100;
    paramsLTPSim.isi_pre_ms.defaultVal = 300;
    paramsLTPSim.numPulses_pre.defaultVal = 2;
    paramsLTPSim.pulseStart_post_ms.defaultVal = 0;
    paramsLTPSim.pulseHeight_post_nA.defaultVal = 20;
    paramsLTPSim.pulseSubsequentHeight_post_nA.defaultVal = 20;
    paramsLTPSim.pulseWidth_post_ms.defaultVal = 100;
    paramsLTPSim.isi_post_ms.defaultVal = 300;
    paramsLTPSim.numPulses_post.defaultVal = 1;
    paramsLTPSim.totalDuration_ms.defaultVal = 750;

    layout = [
        ['Presynaptic Cell Properties', ['C_pre_nF', 'g_leak_pre_uS', 
            'E_leak_pre_mV', 'g_Na_pre_uS', 'E_Na_pre_mV', 'g_K_pre_uS', 
            'E_K_pre_mV']],
        ['Postsynaptic Cell Properties', ['C_post_nF', 'g_leak_post_uS', 
            'E_leak_post_mV', 'g_Na_post_uS', 'E_Na_post_mV', 'g_K_post_uS', 
            'E_K_post_mV', 'Ca_buff_post_ms']],
        ['Synapse Properties', ['g_AMPA_max_uS', 'g_AMPA_min_uS', 'E_rev_AMPA_mV',
            'g_NMDA_uS', 'E_rev_NMDA_mV', 'Mg_mM', 'threshold_syn_mV']],
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 'pulseHeight_pre_nA',
            'pulseSubsequentHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Postsynaptic Current Clamp', ['pulseStart_post_ms', 'pulseHeight_post_nA',
            'pulseSubsequentHeight_post_nA', 'pulseWidth_post_ms', 'isi_post_ms', 
            'numPulses_post']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('SynapseCurrentClampGlutamatergicControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('SynapseCurrentClampGlutamatergicData');
    dataPanel.className = 'datapanel';

    preVoltageDataTable = document.createElement('table');
    preVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(preVoltageDataTable);

    postVoltageDataTable = document.createElement('table');
    postVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(postVoltageDataTable);

    preCurrentDataTable = document.createElement('table');
    preCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(preCurrentDataTable);

    postCurrentDataTable = document.createElement('table');
    postCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(postCurrentDataTable);

//    preCaConcDataTable = document.createElement('table');
//    preCaConcDataTable.className = 'datatable';
//    dataPanel.appendChild(preCaConcDataTable);

    postCaConcDataTable = document.createElement('table');
    postCaConcDataTable.className = 'datatable';
    dataPanel.appendChild(postCaConcDataTable);

    AMPACurrentDataTable = document.createElement('table');
    AMPACurrentDataTable.className = 'datatable';
    dataPanel.appendChild(AMPACurrentDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, AMPASynapse, NMDASynapse,
            V_rest_pre = -64.954, V_rest_post = -70.785,
            neuron_pre, pulseTrain_pre, hhKCurrent_pre, hhNaCurrent_pre, PCurrent_pre,
            neuron_post, pulseTrain_post, hhKCurrent_post, hhNaCurrent_post, PCurrent_post,
            prerun, result,
            v_pre, v_pre_mV, CaConc_pre, CaConc_pre_nM,
            AMPAr, AMPAs, AMPAtransmitter, AMPAcurrent,
            NMDAr, NMDAtransmitter, NMDAcurrent,
            mGate, hGate, nGate,
            v_post, v_post_mV, CaConc_post, CaConc_post_nM,
            iStim_pre, iStim_pre_nA, iStim_post, iStim_post_nA,
            params, plot, plotPanel, title, j; 
        
        params = controls.values;
        model = componentModel.componentModel();

        // create the presynaptic passive membrane
        neuron_pre = electrophys.passiveMembrane(model, {
            V_rest: V_rest_pre * 1e-3,
            C: params.C_pre_nF * 1e-9, 
            g_leak: params.g_leak_pre_uS * 1e-6, 
            E_leak: params.E_leak_pre_mV * 1e-3,
            Ca_init:   0.001, // uM
            Ca_steady: 0.001, // uM
            K1: 5e8, // uM C^-1
            K2: 1e3 / params.Ca_buff_pre_ms  // s^-1
        });

        pulseTrain_pre = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_pre_ms, 
            width: params.pulseWidth_pre_ms * 1e-3, 
            height: params.pulseHeight_pre_nA * 1e-9,
            subsequentHeight: params.pulseSubsequentHeight_pre_nA * 1e-9,
            gap: params.isi_pre_ms * 1e-3,
            num_pulses: params.numPulses_pre
        });
        neuron_pre.addCurrent(pulseTrain_pre);
        
        hhKCurrent_pre = electrophys.hhKConductance(model, neuron_pre, {
            V_rest: V_rest_pre * 1e-3,
            g_K: params.g_K_pre_uS * 1e-6,
            E_K: params.E_K_pre_mV * 1e-3
        });
        
        hhNaCurrent_pre = electrophys.hhNaConductance(model, neuron_pre, {
            V_rest: V_rest_pre * 1e-3,
            g_Na: params.g_Na_pre_uS * 1e-6,
            E_Na: params.E_Na_pre_mV * 1e-3
        });
        
        PCurrent_pre = electrophys.multiConductance.PConductance(model, neuron_pre, {
            V_rest: V_rest_pre * 1e-3,
            g_P: params.g_P_pre_uS * 1e-6,
            E_Ca: params.E_Ca_pre_mV * 1e-3
        });
        
        // create the postsynaptic passive membrane
        neuron_post = electrophys.passiveMembrane(model, {
            V_rest: V_rest_post * 1e-3,
            C: params.C_post_nF * 1e-9, 
            g_leak: params.g_leak_post_uS * 1e-6, 
            E_leak: params.E_leak_post_mV * 1e-3,
            Ca_init:   0.001, // uM
            Ca_steady: 0.001, // uM
            K1: 5e8, // uM C^-1
            K2: 1e3 / params.Ca_buff_post_ms  // s^-1
        });

        pulseTrain_post = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_post_ms, 
            width: params.pulseWidth_post_ms * 1e-3, 
            height: params.pulseHeight_post_nA * 1e-9,
            subsequentHeight: params.pulseSubsequentHeight_post_nA * 1e-9,
            gap: params.isi_post_ms * 1e-3,
            num_pulses: params.numPulses_post
        });
        neuron_post.addCurrent(pulseTrain_post);
        
        hhKCurrent_post = electrophys.hhKConductance(model, neuron_post, {
            V_rest: V_rest_post * 1e-3,
            g_K: params.g_K_post_uS * 1e-6,
            E_K: params.E_K_post_mV * 1e-3
        });
        
        hhNaCurrent_post = electrophys.hhNaConductance(model, neuron_post, {
            V_rest: V_rest_post * 1e-3,
            g_Na: params.g_Na_post_uS * 1e-6,
            E_Na: params.E_Na_post_mV * 1e-3
        });

        PCurrent_post = electrophys.multiConductance.PConductance(model, neuron_post, {
            V_rest: V_rest_post * 1e-3,
            g_P: params.g_P_post_uS * 1e-6,
            E_Ca: params.E_Ca_post_mV * 1e-3
        });
        

        // create the AMPA receptor-mediated current
        AMPASynapse = electrophys.AMPASynapse(model, neuron_pre, neuron_post, {
            g_max: params.g_AMPA_max_uS * 1e-6, 
            g_min: params.g_AMPA_min_uS * 1e-6, 
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
            tMin: -20e-3, 
            tMax: 0, 
            tMaxStep: 1e-4,
            atol: 1e-7,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-4,
            atol: 1e-7,
            y0: prerun.y_f
        });
        
        v_pre           = result.mapOrderedPairs(neuron_pre.V);
        CaConc_pre      = result.mapOrderedPairs(neuron_pre.Ca);
        AMPAr           = result.mapOrderedPairs(AMPASynapse.r);
        AMPAs           = result.mapOrderedPairs(AMPASynapse.s);
        AMPAtransmitter = result.mapOrderedPairs(AMPASynapse.transmitter);
        AMPAcurrent     = result.mapOrderedPairs(AMPASynapse.current);
        NMDAr           = result.mapOrderedPairs(NMDASynapse.r);
        NMDAtransmitter = result.mapOrderedPairs(NMDASynapse.transmitter);
        NMDAcurrent     = result.mapOrderedPairs(NMDASynapse.current);
        mGate           = result.mapOrderedPairs(hhNaCurrent_post.m);
        hGate           = result.mapOrderedPairs(hhNaCurrent_post.h);
        nGate           = result.mapOrderedPairs(hhKCurrent_post.n);
        v_post          = result.mapOrderedPairs(neuron_post.V);
        CaConc_post     = result.mapOrderedPairs(neuron_post.Ca);
        iStim_pre       = result.mapOrderedPairs(pulseTrain_pre);
        iStim_post      = result.mapOrderedPairs(pulseTrain_post);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_pre_mV        = v_pre.map           (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        CaConc_pre_nM   = CaConc_pre.map      (function (c) {return [c[0] / 1e-3,  c[1] / 1e-3];});
        AMPAr           = AMPAr.map           (function (r) {return [r[0] / 1e-3,  r[1]       ];});
        AMPAs           = AMPAs.map           (function (s) {return [s[0] / 1e-3,  s[1]       ];});
        AMPAtransmitter = AMPAtransmitter.map (function (t) {return [t[0] / 1e-3,  t[1]       ];});
        AMPAcurrent     = AMPAcurrent.map     (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        NMDAr           = NMDAr.map           (function (r) {return [r[0] / 1e-3,  r[1]       ];});
        NMDAtransmitter = NMDAtransmitter.map (function (t) {return [t[0] / 1e-3,  t[1]       ];});
        NMDAcurrent     = NMDAcurrent.map     (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        mGate           = mGate.map           (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate           = hGate.map           (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        nGate           = nGate.map           (function (n) {return [n[0] / 1e-3,  n[1]       ];});
        v_post_mV       = v_post.map          (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        CaConc_post_nM  = CaConc_post.map     (function (c) {return [c[0] / 1e-3,  c[1] / 1e-3];});
        iStim_pre_nA    = iStim_pre.map       (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9]});
        iStim_post_nA   = iStim_post.map      (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9]});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('SynapseCurrentClampGlutamatergicPlots');
        plotPanel.innerHTML = '';

        //*****************
        // VOLTAGE, STIMULATION CURRENT, AND CALCIUM
        //*****************

        if (true) {

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

        }

        //*****************
        // AMPA CURRENT
        //*****************

        if (plotFlag == 'LTP') {

            // AMPA current
            title = document.createElement('h4');
            title.innerHTML = 'AMPA Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'AMPACurrentPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('AMPACurrentPlot', [AMPAcurrent], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>AMPA</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#AMPACurrentPlot', AMPACurrentDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#AMPACurrentPlot', 'Time', 'ms', 'nA');

        }

//        // AMPA r
//        title = document.createElement('h4');
//        title.innerHTML = 'AMPA r';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'AMPArPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('AMPArPlot', [AMPAr], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {
//                        label:'r',
//                        min: 0, max: 1,
//                        numberTicks: 6,
//                    },
//                },
//                series: [
//                    {label: 'r<sub>AMPA</sub>', color: 'black'},
//                ],
//        })));

//        // AMPA s
//        title = document.createElement('h4');
//        title.innerHTML = 'AMPA s';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'AMPAsPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('AMPAsPlot', [AMPAs], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {
//                        label:'s',
//                        min: 0, max: 1,
//                        numberTicks: 6,
//                    },
//                },
//                series: [
//                    {label: 's<sub>AMPA</sub>', color: 'black'},
//                ],
//        })));

//        // AMPA transmitter
//        title = document.createElement('h4');
//        title.innerHTML = 'AMPA transmitter';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'AMPAtransmitterPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('AMPAtransmitterPlot', [AMPAtransmitter], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Transmitter (mM)'},
//                },
//                series: [
//                    {label: 'AMPA Transmitter', color: 'black'},
//                ],
//        })));

//        // NMDA r
//        title = document.createElement('h4');
//        title.innerHTML = 'NMDA r';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'NMDArPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('NMDArPlot', [NMDAr], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {
//                        label:'r',
//                        min: 0, max: 1,
//                        numberTicks: 6,
//                    },
//                },
//                series: [
//                    {label: 'r<sub>NMDA</sub>', color: 'black'},
//                ],
//        })));

//        // NMDA transmitter
//        title = document.createElement('h4');
//        title.innerHTML = 'NMDA transmitter';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'NMDAtransmitterPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('NMDAtransmitterPlot', [NMDAtransmitter], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Transmitter (mM)'},
//                },
//                series: [
//                    {label: 'NMDA Transmitter', color: 'black'},
//                ],
//        })));

//        // NMDA current
//        title = document.createElement('h4');
//        title.innerHTML = 'NMDA current';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'NMDAcurrentPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//           $.jqplot('NMDAcurrentPlot', [NMDAcurrent], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Current (nA)'},
//                },
//                series: [
//                    {label: 'I<sub>NMDA</sub>', color: 'black'},
//                ],
//        })));

//        // Post Gates
//        title = document.createElement('h4');
//        title.innerHTML = 'Postsynaptic Gates';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'gatePlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('gatePlot', [mGate, hGate, nGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                legend: {show: true},
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {
//                        label:'Gate',
//                        min: 0, max: 1,
//                        numberTicks: 6,
//                    }
//                },
//                series: [
//                    {label: 'm', color: 'blue'},
//                    {label: 'h', color: 'purple'},
//                    {label: 'n', color: 'red'},
//                ],
//        })));
//        graphJqplot.bindCursorTooltip('#gatePlot', 'Time', 'ms', '');

//        // Pre Calcium
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
        
    }


    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function resetToDefaultSim() {
        plotFlag = 'default';
        reset(paramsDefaultSim, layout);
    }


    function resetToLTPSim() {
        plotFlag = 'LTP';
        reset(paramsLTPSim, layout);
    }


    function clearDataTables() {
        preVoltageDataTable.innerHTML = '';
        preVoltageDataTable.style.display = 'none';

        postVoltageDataTable.innerHTML = '';
        postVoltageDataTable.style.display = 'none';

        preCurrentDataTable.innerHTML = '';
        preCurrentDataTable.style.display = 'none';

        postCurrentDataTable.innerHTML = '';
        postCurrentDataTable.style.display = 'none';

//        preCaConcDataTable.innerHTML = '';
//        preCaConcDataTable.style.display = 'none';

        postCaConcDataTable.innerHTML = '';
        postCaConcDataTable.style.display = 'none';

        AMPACurrentDataTable.innerHTML = '';
        AMPACurrentDataTable.style.display = 'none';
    }


    (document.getElementById('SynapseCurrentClampGlutamatergicRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SynapseCurrentClampGlutamatergicClearDataButton')
        .addEventListener('click', clearDataTables, false));
    (document.getElementById('SynapseCurrentClampGlutamatergicDefaultSimButton')
        .addEventListener('click', resetToDefaultSim, false));
    (document.getElementById('SynapseCurrentClampGlutamatergicLTPSimButton')
        .addEventListener('click', resetToLTPSim, false));
    

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

