/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the passive membrane simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 2, minVal: 0.01, maxVal: 100 }, 
        g_Na_uS: { label: 'Membrane sodium conductance', units: '\u00B5S', 
            defaultVal: 0.1, minVal: 0.01, maxVal: 100 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_uS: { label: 'Membrane potassium conductance', units: '\u00B5S', 
            defaultVal: 3, minVal: 0.01, maxVal: 100 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -80, minVal: -1000, maxVal: 1000 }, 
        g_Cl_uS: { label: 'Membrane chloride conductance', units: '\u00B5S', 
            defaultVal: 0.1, minVal: 0.01, maxVal: 100 }, 
        E_Cl_mV: { label: 'Chloride Nernst potential', units: 'mV',
            defaultVal: -70, minVal: -1000, maxVal: 1000 }, 
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_Na_uS', 'E_Na_mV', 'g_K_uS', 'E_K_mV',
            'g_Cl_uS', 'E_Cl_mV']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('NernstPassiveMembraneControls');

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, nernstPassiveMembrane, pulseTrain, V_steadyState, NaCurrent, KCurrent, ClCurrent,
            result, v, iNa, iK, iCl, iStim,
            v_mV, iNa_nA, iK_nA, iCl_nA, params, iStim_nA,
            plotPanel, plot, plotDefaultOptions;
        
        params = controls.values;

        V_steadyState = (params.g_Na_uS * params.E_Na_mV + 
            params.g_K_uS * params.E_K_mV + params.g_Cl_uS * params.E_Cl_mV) /
            (params.g_Na_uS + params.g_K_uS + params.g_Cl_uS) * 1e-3;
        
        // create the passive membrane
        model = componentModel.componentModel();
        nernstPassiveMembrane = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: 0, 
            E_leak: V_steadyState
        });

        NaCurrent = electrophys.passiveConductance(
            nernstPassiveMembrane, 
            { g: params.g_Na_uS * 1e-6, E_rev: params.E_Na_mV * 1e-3 }
        );
        KCurrent = electrophys.passiveConductance(
            nernstPassiveMembrane, 
            { g: params.g_K_uS * 1e-6, E_rev: params.E_K_mV * 1e-3 }
        );
        ClCurrent = electrophys.passiveConductance(
            nernstPassiveMembrane, 
            { g: params.g_Cl_uS * 1e-6, E_rev: params.E_Cl_mV * 1e-3 }
        );

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        nernstPassiveMembrane.addCurrent(pulseTrain);
        
        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / 
                (params.g_Na_uS + params.g_K_uS + params.g_Cl_uS) * 1e-3) 
        });
        
        v     = result.mapOrderedPairs(nernstPassiveMembrane.V);
        iNa   = result.mapOrderedPairs(NaCurrent.current);
        iK    = result.mapOrderedPairs(KCurrent.current);
        iCl   = result.mapOrderedPairs(ClCurrent.current);
        iStim = result.mapOrderedPairs(pulseTrain);

        v_mV     = v.map     (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        iNa_nA   = iNa.map   (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iK_nA    = iK.map    (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iCl_nA   = iCl.map   (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iStim_nA = iStim.map (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('NernstPassiveMembranePlots');
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

        // Voltage
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('voltagePlot', [v_mV], jQuery.extend(true, {}, plotDefaultOptions, {
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

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlot', [iNa_nA, iK_nA, iCl_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                legend: {show: true},
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Current (nA)'},
                },
                series: [
                    {label: 'I<sub>Na</sub>',   color: 'blue'},
                    {label: 'I<sub>K</sub>',    color: 'red'},
                    {label: 'I<sub>Cl</sub>',   color: 'green'},
                ],
        })));

        // Stimulus current
        plot = document.createElement('div');
        plot.id = 'stimPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('stimPlot', [iStim_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Stimulation Current (nA)'},
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

    (document.getElementById('NernstPassiveMembraneRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('NernstPassiveMembraneResetButton')
        .addEventListener('click', reset, false));
    
    // make the enter key run the simulation (after a slight delay to allow
    // the edit box to fire a change event first).  
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
