/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 1000e-3, plotHandles = []; 

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
        pulseStart_pre_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 2, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_pre_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_pre_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_pre_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_pre: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },

        g_syn_uS: { label: 'Maximum conductance', units: '\u00B5S', 
            defaultVal: 0.5, minVal: 0, maxVal: 1000 },
        E_rev_syn_mV: { label: 'Reversal potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        tau_r_ms: { label: 'Rise time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },
        tau_d_ms: { label: 'Decay time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },
        V_thresh_mV: { label: 'Threshold potential', units: 'mV', 
            defaultVal: 2, minVal: -1000, maxVal: 1000 },
        K_p: { label: 'Threshold width', units: 'mV', 
            defaultVal: 5, minVal: 0.1, maxVal: 1000 },

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
        pulseStart_post_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_post_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_post_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_post_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_post: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Presynaptic Cell Properties', ['C_pre_nF', 'g_leak_pre_uS', 
            'E_leak_pre_mV', 'g_Na_pre_uS', 'E_Na_pre_mV', 'g_K_pre_uS', 
            'E_K_pre_mV']],
        ['Presynaptic Current Clamp', ['pulseStart_pre_ms', 
            'pulseHeight_pre_nA', 'pulseWidth_pre_ms', 'isi_pre_ms', 
            'numPulses_pre']],
        ['Synapse properties', [ 'g_syn_uS', 'E_rev_syn_mV', 'tau_r_ms',
            'tau_d_ms', 'V_thresh_mV', 'K_p']],
        ['Postsynaptic Cell Properties', ['C_post_nF', 'g_leak_post_uS', 
            'E_leak_post_mV', 'g_Na_post_uS', 'E_Na_post_mV', 'g_K_post_uS', 
            'E_K_post_mV']],
        ['Postsynaptic Current Clamp', ['pulseStart_post_ms', 
            'pulseHeight_post_nA', 'pulseWidth_post_ms', 'isi_post_ms', 
            'numPulses_post']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('SynapseCurrentClampControls');

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, synapse,
            neuron_pre, pulseTrain_pre, hhKCurrent_pre, hhNaCurrent_pre,
            neuron_post, pulseTrain_post, hhKCurrent_post, hhNaCurrent_post,
            prerun, result,
            v_pre, v_pre_mV, iStim_pre, iStim_pre_nA, 
            v_post, v_post_mV, iStim_post, iStim_post_nA,
            params, plot, plotPanel, plotDefaultOptions, title, j; 
        
        params = controls.values;
        model = componentModel.componentModel();

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
            g_K: params.g_K_pre_uS * 1e-6,
            E_K: params.E_K_pre_mV * 1e-3
        });
        
        hhNaCurrent_pre = electrophys.hhNaConductance(model, neuron_pre, {
            g_Na: params.g_Na_pre_uS * 1e-6,
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
            g_K: params.g_K_post_uS * 1e-6,
            E_K: params.E_K_post_mV * 1e-3
        });
        
        hhNaCurrent_post = electrophys.hhNaConductance(model, neuron_post, {
            g_Na: params.g_Na_post_uS * 1e-6,
            E_Na: params.E_Na_post_mV * 1e-3
        });


        // create the synapse
        synapse = electrophys.synapse(model, neuron_pre, neuron_post, {
            g_bar: params.g_syn_uS * 1e-6 / (
                1 / (1 + params.tau_r_ms / params.tau_d_ms)
            ), 
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
        
        //t = result.t;
        //t_ms = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(t);

        //v_pre = neuron_pre.V(result.y, result.t);
        //v_pre_mV = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(v_pre);
        
        //iStim_pre_nA = t.map(function (t) {
        //    return pulseTrain_pre([], t) / 1e-9; 
        //});

        //v_post = neuron_post.V(result.y, result.t);
        //v_post_mV = graph.linearAxis(0, 1, 0, 1000).mapWorldToDisplay(v_post);
      
        //iStim_post_nA = t.map(function (t) {
        //    return pulseTrain_post([], t) / 1e-9; 
        //});

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
        plotPanel = document.getElementById('SynapseCurrentClampPlots');
        plotPanel.innerHTML = '';
        plotDefaultOptions = {
            grid: {
                shadow: false,
            },
            legend: {
                placement: 'outside',
            },
            cursor: {
                show: true,
                zoom: true,
                looseZoom: false,
                followMouse: true,
                useAxesFormatters: false,
                showVerticalLine: true,
                showTooltipDataPosition: true,
                tooltipFormatString: "%s: %.2f, %.2f",
            },
            axes: {
                xaxis: {
                    min: 0,
                    max: params.totalDuration_ms,
                    tickOptions: {formatString: '%.2f'},
                },
            },
            axesDefaults: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            },
            seriesDefaults: {
                showMarker: false,
                lineWidth: 1,
                shadow: false,
            }
        };

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
           $.jqplot('preVoltagePlot', [v_pre_mV], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f mV",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));

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
           $.jqplot('preCurrentPlot', [iStim_pre_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
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
           $.jqplot('postVoltagePlot', [v_post_mV], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f mV",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));

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
           $.jqplot('postCurrentPlot', [iStim_post_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
                ],
        })));
    }

    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('SynapseCurrentClampRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SynapseCurrentClampResetButton')
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

