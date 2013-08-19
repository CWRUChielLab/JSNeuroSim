/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsRecruitmentAndSummation, paramsRecruitmentOnly,
        layout, controlsPanel, controls, dataPanel, lengthDataTable,
        activationDataTable, neuralDataTable, tMax = 3000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    paramsRecruitmentAndSummation = {
        T0_ms: { label: 'Base firing period', units: 'ms',
            defaultVal: 120, minVal: 0, maxVal: 500 },
        Tslope_ms: { label: 'Firing period slope', units: 'ms',
            defaultVal: 50, minVal: -100, maxVal: 100 },
        Lrestspring: { label: 'Spring position', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 20.0 },
        k: { label: 'Spring stiffness', units: 'N/cm',
            defaultVal: 0.01, minVal: 0, maxVal: 0.5 },
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 100, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight: { label: 'Stimulus first pulse', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseSubsequentHeight: { label: 'Stimulus subsequent pulses', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 3, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsRecruitmentOnly = JSON.parse(JSON.stringify(paramsRecruitmentAndSummation));
    paramsRecruitmentOnly.T0_ms.defaultVal = 80;
    paramsRecruitmentOnly.Tslope_ms.defaultVal = 0;

    layout = [
        ['Spring Properties', ['Lrestspring', 'k']],
        ['Neural Input', ['pulseStart_ms', 'pulseHeight', 
            'pulseSubsequentHeight', 'pulseWidth_ms', 'isi_ms',
            'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];

    controlsPanel = document.getElementById('MuscleControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MuscleData');
    dataPanel.className = 'datapanel';

    lengthDataTable = document.createElement('table');
    lengthDataTable.className = 'datatable';
    dataPanel.appendChild(lengthDataTable);

    activationDataTable = document.createElement('table');
    activationDataTable.className = 'datatable';
    dataPanel.appendChild(activationDataTable);

    neuralDataTable = document.createElement('table');
    neuralDataTable.className = 'datatable';
    dataPanel.appendChild(neuralDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, neuralInput, muscle,
            prerun, result, L, A, neural,
            plotPanel, plot; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        neuralInput = electrophys.pulseTrain({
            start: params.pulseStart_ms * 1e-3, 
            width: params.pulseWidth_ms * 1e-3, 
            baseline: 0.001,
            height: params.pulseHeight,
            subsequentHeight: params.pulseSubsequentHeight,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });

        muscle = electrophys.muscle(model, {
            neuralInput: neuralInput,
            T0: params.T0_ms * 1e-3,
            Tslope: params.Tslope_ms * 1e-3,
            Lrestspring: params.Lrestspring,
            k: params.k
        });
        
        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -60e-3, 
            tMax: 0, 
            tMaxStep: 1e-2,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-2,
            y0: prerun.y_f
        });
        
        L      = result.mapOrderedPairs(muscle.L);
        A      = result.mapOrderedPairs(muscle.A);
        neural = result.mapOrderedPairs(neuralInput);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        L      = L.map      (function (l) {return [l[0] / 1e-3, l[1]];});
        A      = A.map      (function (a) {return [a[0] / 1e-3, a[1]];});
        neural = neural.map (function (n) {return [n[0] / 1e-3, n[1]];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('MusclePlots');
        plotPanel.innerHTML = '';

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
                    yaxis: {label:'Length (cm)'},
                },
                series: [
                    {label: 'Length', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#lengthPlot', lengthDataTable, 'Muscle Length', 'Time');
        graphJqplot.bindCursorTooltip('#lengthPlot', 'Time', 'ms', 'cm');

        // Muscle activation
        plot = document.createElement('div');
        plot.id = 'activationPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('activationPlot', [A], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Activation'},
                },
                series: [
                    {label: 'Activation', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#activationPlot', activationDataTable, 'Muscle Activation', 'Time');
        graphJqplot.bindCursorTooltip('#activationPlot', 'Time', 'ms', '');

        // Neural input
        plot = document.createElement('div');
        plot.id = 'neuralPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('neuralPlot', [neural], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Neural Input'},
                },
                series: [
                    {label: 'Neural Input', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#neuralPlot', neuralDataTable, 'Neural Input', 'Time');
        graphJqplot.bindCursorTooltip('#neuralPlot', 'Time', 'ms', '');
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

        activationDataTable.innerHTML = '';
        activationDataTable.style.display = 'none';

        neuralDataTable.innerHTML = '';
        neuralDataTable.style.display = 'none';
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

