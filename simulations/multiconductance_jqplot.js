/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, voltageDataTable,
        currentDataTable, conductanceDataTable, gateDataTable, stimDataTable,
        tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the passive membrane simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 0.04, minVal: 0.01, maxVal: 100 }, 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.005, minVal: 0, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -50, minVal: -1000, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -80, minVal: -1000, maxVal: 1000},
        g_K_uS: { label: 'Delayed rectifier potassium conductance', units: '\u00B5S',
            defaultVal: 1.3, minVal: 0, maxVal: 100},
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 60, minVal: -1000, maxVal: 1000},
        g_Na_uS: { label: 'Fast transient sodium conductance', units: '\u00B5S',
            defaultVal: 0.7, minVal: 0, maxVal: 100},
        g_NaP_uS: { label: 'Persistent sodium conductance', units: '\u00B5S',
            defaultVal: 0.05, minVal: 0, maxVal: 100},
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_leak_uS', 'E_leak_mV']],
        ['Potassium Currents', ['E_K_mV', 'g_K_uS']],
        ['Sodium Currents', ['E_Na_mV', 'g_Na_uS', 'g_NaP_uS']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('MultiConductanceControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MultiConductanceData');
    dataPanel.className = 'datapanel';

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);

    currentDataTable = document.createElement('table');
    currentDataTable.className = 'datatable';
    dataPanel.appendChild(currentDataTable);

    conductanceDataTable = document.createElement('table');
    conductanceDataTable.className = 'datatable';
    dataPanel.appendChild(conductanceDataTable);

    gateDataTable = document.createElement('table');
    gateDataTable.className = 'datatable';
    dataPanel.appendChild(gateDataTable);

    stimDataTable = document.createElement('table');
    stimDataTable.className = 'datatable';
    dataPanel.appendChild(stimDataTable);

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain,
            V_rest = -71.847e-3, 
            KCurrent, NaCurrent, NaPCurrent,
            result, v, iLeak, iStim,
            iK, iNa, iNaP,
            gK, gNa, gNaP,
            v_mV, iLeak_nA, params, iStim_nA,
            iK_nA, iNa_nA, iNaP_nA,
            gK_uS, gNa_uS, gNaP_uS,
            nGate, mGate, hGate, mNaPGate, hNaPGate,
            plotPanel, plot;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        neuron = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: params.g_leak_uS * 1e-6, 
            E_leak: params.E_leak_mV * 1e-3,
            V_rest: V_rest
        });

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        neuron.addCurrent(pulseTrain);
        
        KCurrent = electrophys.multiConductance.KConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3,
            V_rest: V_rest
        });
        
        NaCurrent = electrophys.multiConductance.NaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3,
            V_rest: V_rest
        });
        
        NaPCurrent = electrophys.multiConductance.NaPConductance(model, neuron, {
            g_NaP: params.g_NaP_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3,
            V_rest: V_rest
        });
        

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / params.g_leak_uS * 1e-3) 
        });
        
        v        = result.mapOrderedPairs(neuron.V);
        iLeak    = result.mapOrderedPairs(neuron.leak.current);
        iK       = result.mapOrderedPairs(KCurrent.current);
        iNa      = result.mapOrderedPairs(NaCurrent.current);
        iNaP     = result.mapOrderedPairs(NaPCurrent.current);
        gK       = result.mapOrderedPairs(KCurrent.g);
        gNa      = result.mapOrderedPairs(NaCurrent.g);
        gNaP     = result.mapOrderedPairs(NaPCurrent.g);
        nGate    = result.mapOrderedPairs(KCurrent.n);
        mGate    = result.mapOrderedPairs(NaCurrent.m);
        hGate    = result.mapOrderedPairs(NaCurrent.h);
        mNaPGate = result.mapOrderedPairs(NaPCurrent.m);
        hNaPGate = result.mapOrderedPairs(NaPCurrent.h);
        iStim    = result.mapOrderedPairs(pulseTrain);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_mV     = v.map        (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        iLeak_nA = iLeak.map    (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iK_nA    = iK.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iNa_nA   = iNa.map      (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iNaP_nA  = iNaP.map     (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        gK_uS    = gK.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gNa_uS   = gNa.map      (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gNaP_uS  = gNaP.map     (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        nGate    = nGate.map    (function (n) {return [n[0] / 1e-3,  n[1]       ];});
        mGate    = mGate.map    (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate    = hGate.map    (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        mNaPGate = mNaPGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        hNaPGate = hNaPGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        iStim_nA = iStim.map    (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('MultiConductancePlots');
        plotPanel.innerHTML = '';

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

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlot', [iLeak_nA, iK_nA, iNa_nA, iNaP_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>leak</sub>', color: 'black'},
                    {label: 'I<sub>K</sub>',  color: 'red'},
                    {label: 'I<sub>Na</sub>',   color: 'blue'},
                    {label: 'I<sub>NaP</sub>',   color: 'green'},
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
            $.jqplot('conductancePlot', [gK_uS, gNa_uS, gNaP_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>K</sub>',  color: 'red'},
                    {label: 'g<sub>Na</sub>', color: 'blue'},
                    {label: 'g<sub>NaP</sub>', color: 'green'},
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
            $.jqplot('gatePlot', [nGate, mGate, hGate, mNaPGate, hNaPGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
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
                    {label: 'n', color: 'red'},
                    {label: 'm', color: 'blue'},
                    {label: 'h', color: 'purple'},
                    {label: 'm<sub>NaP</sub>', color: 'green'},
                    {label: 'h<sub>NaP</sub>', color: 'lime'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlot', gateDataTable, 'Gate', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlot', 'Time', 'ms', '');

        // Stimulus current
        plot = document.createElement('div');
        plot.id = 'stimPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('stimPlot', [iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Stimulation Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#stimPlot', stimDataTable, 'Stimulation Current', 'Time');
        graphJqplot.bindCursorTooltip('#stimPlot', 'Time', 'ms', 'nA');
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearDataTables() {
        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';

        currentDataTable.innerHTML = '';
        currentDataTable.style.display = 'none';

        conductanceDataTable.innerHTML = '';
        conductanceDataTable.style.display = 'none';

        gateDataTable.innerHTML = '';
        gateDataTable.style.display = 'none';

        stimDataTable.innerHTML = '';
        stimDataTable.style.display = 'none';
    }


    (document.getElementById('MultiConductanceRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MultiConductanceResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('MultiConductanceClearDataButton')
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

