/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, preVoltageDataTable,
        preCurrentDataTable, postVoltageDataTable, postCurrentDataTable,
        tMax = 10000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    params = { 
        prestim_freq_Hz: { label: 'Prestimulation frequency', units: 'Hz',
            defaultVal: 50, minVal: 0.001, maxVal: 200 },
        prestim_duration_s: { label: 'Prestimulation duration', units: 's',
            defaultVal: 0, minVal: 0, maxVal: 1000 },
        prestim_delay_min: { label: 
            'Delay between prestimulation and experiment', units: 'min',
            defaultVal: 10, minVal: 0, maxVal: 1000 },
        SNP_uM: { label: 'Sodium nitroprusside (SNP)', units: '\u00B5M',
            defaultVal: 0, minVal: 0, maxVal: 2000 },
        TEA_mM: { label: 'Tetraethyl amonium (TEA)', units: 'mM',
            defaultVal: 0, minVal: 0, maxVal: 3 },

        C_pre_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 0.1, minVal: 0.001, maxVal: 100 }, 
        g_leak_pre_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.007, minVal: 0.0001, maxVal: 100 }, 
        E_leak_pre_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -67, minVal: -1000, maxVal: 1000 }, 
        g_Na_pre_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 0.8, minVal: 0, maxVal: 1000 }, 
        E_Na_pre_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 50, minVal: -1000, maxVal: 1000 }, 
        g_K_pre_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 0.14, minVal: 0, maxVal: 1000 }, 
        E_K_pre_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -70, minVal: -1000, maxVal: 1000 }, 
        pulseStart_pre_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_pre_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 4, minVal: -1000, maxVal: 1000 },
        pulseWidth_pre_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 0.5, minVal: 0, maxVal: tMax / 1e-3 },
        isi_pre_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_pre: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        g_syn_uS: { label: 'Maximum conductance', units: '\u00B5S', 
            defaultVal: 0.02, minVal: 0, maxVal: 1000 },
        E_rev_syn_mV: { label: 'Reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        tau_r_ms: { label: 'Rise time constant', units: 'ms', 
            defaultVal: 1, minVal: 0.1, maxVal: 1000 },
        tau_d_ms: { label: 'Decay time constant', units: 'ms', 
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        V_thresh_mV: { label: 'Threshold potential', units: 'mV', 
            defaultVal: -10, minVal: -1000, maxVal: 1000 },
        K_p: { label: 'Threshold width', units: 'mV', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },

        C_post_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 0.1, minVal: 0.001, maxVal: 100 }, 
        g_leak_post_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.007, minVal: 0.001, maxVal: 100 }, 
        E_leak_post_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -67, minVal: -1000, maxVal: 1000 }, 
        g_Na_post_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 0.8, minVal: 0, maxVal: 1000 }, 
        E_Na_post_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 50, minVal: -1000, maxVal: 1000 }, 
        g_K_post_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 0.14, minVal: 0, maxVal: 1000 }, 
        E_K_post_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -70, minVal: -1000, maxVal: 1000 }, 
        pulseStart_post_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_post_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 4, minVal: -1000, maxVal: 1000 },
        pulseWidth_post_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 0.5, minVal: 0, maxVal: tMax / 1e-3 },
        isi_post_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_post: { label: 'Number of pulses', units: '', 
            defaultVal: 0, minVal: 0, maxVal: 100 },
        /*
        pulseStart_post_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_post_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_post_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 150, minVal: 0, maxVal: tMax / 1e-3 },
        isi_post_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 100, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_post: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        */

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Pretreatment', ['prestim_freq_Hz', 'prestim_duration_s',
            'prestim_delay_min', 'SNP_uM', 'TEA_mM']],        
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 
            'pulseHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Postsynaptic Current Clamp', ['pulseStart_post_ms', 
            'pulseHeight_post_nA', 'pulseWidth_post_ms', 'isi_post_ms', 
            'numPulses_post']],
        ['Simulation Settings', ['totalDuration_ms']]/*,
        ['Synapse properties', [ 'g_syn_uS', 'E_rev_syn_mV', 'tau_r_ms',
            'tau_d_ms', 'V_thresh_mV', 'K_p']],
        ['Presynaptic Cell Properties', ['C_pre_nF', 'g_leak_pre_uS', 
            'E_leak_pre_mV', 'g_Na_pre_uS', 'E_Na_pre_mV', 'g_K_pre_uS', 
            'E_K_pre_mV']],
        ['Postsynaptic Cell Properties', ['C_post_nF', 'g_leak_post_uS', 
            'E_leak_post_mV', 'g_Na_post_uS', 'E_Na_post_mV', 'g_K_post_uS', 
            'E_K_post_mV']]*/
    ];
    controlsPanel = document.getElementById('SynapseCurrentClampNOControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('SynapseCurrentClampNOData');
    dataPanel.className = 'datapanel';

    preVoltageDataTable = document.createElement('table');
    preVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(preVoltageDataTable);

    preCurrentDataTable = document.createElement('table');
    preCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(preCurrentDataTable);

    postVoltageDataTable = document.createElement('table');
    postVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(postVoltageDataTable);

    postCurrentDataTable = document.createElement('table');
    postCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(postCurrentDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, synapse,
            neuron_pre, pulseTrain_pre, hhKCurrent_pre, hhNaCurrent_pre,
            neuron_post, pulseTrain_post, hhKCurrent_post, hhNaCurrent_post,
            prerun, result, t,
            v_pre, v_pre_mV, iStim_pre, iStim_pre_nA, 
            v_post, v_post_mV, iStim_post, iStim_post_nA,
            params, plot, plotPanel, title, j,
            sum1, sum2, dt, t_delay, k, NO_syn,
            f_NO, f_TEA, f_Kv3, f_Na, f_K, f_syn,
            delay_NO = 60, tau_NO = 600, NO_syn_scale = 1 / (0.35 * 60 * 50); 
        
        params = controls.values;
        model = componentModel.componentModel();

        // sum up the effects of the presynaptic stimulation as a series of
        // alpha functions.  Algorithm for summation from
        // Srinivasan R, Chiel HJ. Fast Calculation of Synaptic Conductances.
        // Neural Computation 1993 Mar;5(2):200-204.
        sum1 = 0;
        sum2 = 0;
        dt = 1 / params.prestim_freq_Hz;
        t_delay = params.prestim_delay_min * 60 - delay_NO;
        k = Math.exp(-dt / tau_NO);
        // process each of the spikes
        for (t = -params.prestim_duration_s - Math.min(0, t_delay); 
                t < 0; t += dt) {
            sum1 = k * sum1 + 1;
            sum2 = k * sum2 + t - dt;
        }
        console.log(sum1 + ', ' + sum2 + ', k=' + k);
        // advance time to the beginning of the experiment
        sum1 = Math.exp(-t_delay / tau_NO) * sum1;
        sum2 = Math.exp(-t_delay / tau_NO) * sum2;
        NO_syn = NO_syn_scale / tau_NO * (t_delay * sum1 - sum2);

        // Based on model and data from
        // Steinert JR, Kopp-Scheinpflug C, Baker C, Challiss RAJ, Mistry R,
        // Haustein MD, Griffin SJ, Tong H, Graham BP, Forsythe ID. Nitric
        // oxide is a volume transmitter regulating postsynaptic excitability
        // at a glutamatergic synapse. Neuron 2008 Nov;60(4):642-656.

        f_NO = 1 / (1 + 1 / (1e-6 + params.SNP_uM + 10 * NO_syn * NO_syn));
        f_TEA = 1 / (1 + 1 / (1e-6 + params.TEA_mM / 0.1));
        //f_Na = (800 - 350 * f_NO) / 800;
        f_Na = 1;
        f_Kv3 = (1 - f_NO) * (1 - f_TEA);
        f_K = (20 + 120 * (0.4 + 0.6 * f_Kv3)) / 140;
        f_syn = 1 - 0.5 * f_NO;

        // create the presynaptic passive membrane
        neuron_pre = electrophys.passiveMembrane(model, {
            C: params.C_pre_nF * 1e-9, 
            g_leak: params.g_leak_pre_uS * 1e-6, 
            E_leak: params.E_leak_pre_mV * 1e-3 
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
            g_K: params.g_K_pre_uS * 1e-6 * f_K,
            E_K: params.E_K_pre_mV * 1e-3
        });
        
        hhNaCurrent_pre = electrophys.hhNaConductance(model, neuron_pre, {
            g_Na: params.g_Na_pre_uS * 1e-6 * f_Na,
            E_Na: params.E_Na_pre_mV * 1e-3
        });
        
        // create the postsynaptic passive membrane
        neuron_post = electrophys.passiveMembrane(model, {
            C: params.C_post_nF * 1e-9, 
            g_leak: params.g_leak_post_uS * 1e-6, 
            E_leak: params.E_leak_post_mV * 1e-3 
        });

        pulseTrain_post = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_post_ms, 
            width: params.pulseWidth_post_ms * 1e-3, 
            height: params.pulseHeight_post_nA * 1e-9,
            gap: params.isi_post_ms * 1e-3,
            num_pulses: params.numPulses_post
        });
        neuron_post.addCurrent(pulseTrain_post);
        
        hhKCurrent_post = electrophys.hhKConductance(model, neuron_post, {
            g_K: params.g_K_post_uS * 1e-6 * f_K,
            E_K: params.E_K_post_mV * 1e-3
        });
        
        hhNaCurrent_post = electrophys.hhNaConductance(model, neuron_post, {
            g_Na: params.g_Na_post_uS * 1e-6 * f_Na,
            E_Na: params.E_Na_post_mV * 1e-3
        });


        // create the synapse
        synapse = electrophys.synapse(model, neuron_pre, neuron_post, {
            g_bar: params.g_syn_uS * 1e-6 / (
                1 / (1 + params.tau_r_ms / params.tau_d_ms)
            ) * f_syn, 
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

        v_pre      = result.mapOrderedPairs(neuron_pre.V);
        v_post     = result.mapOrderedPairs(neuron_post.V);
        iStim_pre  = result.mapOrderedPairs(pulseTrain_pre);
        iStim_post = result.mapOrderedPairs(pulseTrain_post);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_pre_mV      = v_pre.map      (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        v_post_mV     = v_post.map     (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
        iStim_pre_nA  = iStim_pre.map  (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});
        iStim_post_nA = iStim_post.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('SynapseCurrentClampNOPlots');
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
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearDataTables() {
        preVoltageDataTable.innerHTML = '';
        preVoltageDataTable.style.display = 'none';

        preCurrentDataTable.innerHTML = '';
        preCurrentDataTable.style.display = 'none';

        postVoltageDataTable.innerHTML = '';
        postVoltageDataTable.style.display = 'none';

        postCurrentDataTable.innerHTML = '';
        postCurrentDataTable.style.display = 'none';
    }


    (document.getElementById('SynapseCurrentClampNORunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SynapseCurrentClampNOResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('SynapseCurrentClampNOClearDataButton')
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

