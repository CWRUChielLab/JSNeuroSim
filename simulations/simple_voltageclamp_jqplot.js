/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, currentDataTable,
        conductanceDataTable, gateDataTable, voltageDataTable,
        tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the voltage clamp simulation
    params = { 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120, minVal: 0.01, maxVal: 1000 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0.01, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        holdingPotential_mV: { label: 'Holding potential', units: 'mV', 
            defaultVal: -70, minVal: -1000, maxVal: 1000 },
        stepPotential_mV: { label: 'First step potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        subsequentStepPotential_mV: { label: 'Subsequent step potential', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        stepStart_ms: { label: 'Step delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        stepWidth_ms: { label: 'Step duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-step interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['g_leak_uS', 'E_leak_mV',
            'g_Na_uS', 'E_Na_mV', 'g_K_uS', 'E_K_mV']],
        ['Voltage Clamp', ['holdingPotential_mV', 'stepPotential_mV',
            'subsequentStepPotential_mV', 'stepStart_ms', 'stepWidth_ms',
            'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('VoltageClampControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('VoltageClampData');
    dataPanel.className = 'datapanel';

    currentDataTable = document.createElement('table');
    currentDataTable.className = 'datatable';
    dataPanel.appendChild(currentDataTable);

    conductanceDataTable = document.createElement('table');
    conductanceDataTable.className = 'datatable';
    dataPanel.appendChild(conductanceDataTable);

    gateDataTable = document.createElement('table');
    gateDataTable.className = 'datatable';
    dataPanel.appendChild(gateDataTable);

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain, hhNaCurrent, hhKCurrent, leakCurrent,
            result, v, gNa, gK, iNa, iK, iLeak, mGate, hGate, nGate,
            v_mV, gNa_uS, gK_uS, iNa_nA, iK_nA, iLeak_nA, params,
            plotPanel, plot, j, prerun, y0; 
        
        // create the clamped membrane
        params = controls.values;
        model = componentModel.componentModel();

        pulseTrain = electrophys.pulseTrain({
            start: params.stepStart_ms * 1e-3, 
            width: params.stepWidth_ms * 1e-3, 
            baseline: params.holdingPotential_mV * 1e-3,
            height: (params.stepPotential_mV - params.holdingPotential_mV) * 1e-3,
            subsequentHeight: (params.subsequentStepPotential_mV - params.holdingPotential_mV) * 1e-3,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });

        neuron = electrophys.clampedMembrane({
            V_clamp: pulseTrain
        });

        hhNaCurrent = electrophys.hhNaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3
        });

        hhKCurrent = electrophys.hhKConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3
        });
        
        leakCurrent = electrophys.passiveConductance(neuron, {
            g:     params.g_leak_uS * 1e-6,
            E_rev: params.E_leak_mV * 1e-3
        });

        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -60e-3, 
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
        
        v     = result.mapOrderedPairs(neuron.V);
        gNa   = result.mapOrderedPairs(hhNaCurrent.g);
        gK    = result.mapOrderedPairs(hhKCurrent.g);
        iNa   = result.mapOrderedPairs(hhNaCurrent.current);
        iK    = result.mapOrderedPairs(hhKCurrent.current);
        iLeak = result.mapOrderedPairs(leakCurrent.current);
        mGate = result.mapOrderedPairs(hhNaCurrent.m);
        hGate = result.mapOrderedPairs(hhNaCurrent.h);
        nGate = result.mapOrderedPairs(hhKCurrent.n);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_mV     = v.map     (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        gNa_uS   = gNa.map   (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gK_uS    = gK.map    (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        iNa_nA   = iNa.map   (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iK_nA    = iK.map    (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iLeak_nA = iLeak.map (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        mGate    = mGate.map (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate    = hGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        nGate    = nGate.map (function (n) {return [n[0] / 1e-3,  n[1]       ];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('VoltageClampPlots');
        plotPanel.innerHTML = '';
        
        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlot', [iNa_nA, iK_nA, iLeak_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>Na</sub>',   color: 'blue'},
                    {label: 'I<sub>K</sub>',    color: 'red'},
                    {label: 'I<sub>leak</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlot', currentDataTable, 'Current', 'Time');
        graphJqplot.bindCursorTooltip('#currentPlot', 'Time', 'ms', 'nA');

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlot', [gNa_uS, gK_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>Na</sub>', color: 'blue'},
                    {label: 'g<sub>K</sub>',  color: 'red'},
                ],
        })));
        graphJqplot.bindDataCapture('#conductancePlot', conductanceDataTable, 'Conductance', 'Time');
        graphJqplot.bindCursorTooltip('#conductancePlot', 'Time', 'ms', '\u00B5S');

        // Gates
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
                    {label: 'h', color: 'navy'},
                    {label: 'n', color: 'red'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlot', gateDataTable, 'Gate', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlot', 'Time', 'ms', '');

        // Voltage
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('voltagePlot', [v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#voltagePlot', voltageDataTable, 'Membrane Potential', 'Time');
        graphJqplot.bindCursorTooltip('#voltagePlot', 'Time', 'ms', 'mV');
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        clearDataTables();
        runSimulation();
    }


    function clearDataTables() {
        currentDataTable.innerHTML = '';
        currentDataTable.style.display = 'none';

        conductanceDataTable.innerHTML = '';
        conductanceDataTable.style.display = 'none';

        gateDataTable.innerHTML = '';
        gateDataTable.style.display = 'none';

        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';
    }


    (document.getElementById('VoltageClampRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('VoltageClampResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('VoltageClampClearDataButton')
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

}, false);

