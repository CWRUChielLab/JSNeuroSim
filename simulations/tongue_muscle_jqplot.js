/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsRecruitmentAndSummation, paramsRecruitmentOnly,
        layout, controlsPanel, controls, dataPanel, LLDataTable,
        LCDataTable, ALDataTable, ACDataTable, inputLDataTable,
        inputCDataTable, tMax = 3000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    paramsRecruitmentAndSummation = {
        T0L_ms: { label: 'L Base firing period', units: 'ms',
            defaultVal: 120, minVal: 0, maxVal: 500 },
        TslopeL_ms: { label: 'L Firing period slope', units: 'ms',
            defaultVal: 50, minVal: -100, maxVal: 100 },
        T0C_ms: { label: 'C Base firing period', units: 'ms',
            defaultVal: 120, minVal: 0, maxVal: 500 },
        TslopeC_ms: { label: 'C Firing period slope', units: 'ms',
            defaultVal: 50, minVal: -100, maxVal: 100 },
        pulseLStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 100, minVal: 0, maxVal: tMax / 1e-3 },
        pulseLHeight: { label: 'Stimulus first pulse', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseLSubsequentHeight: { label: 'Stimulus subsequent pulses', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseLWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        isiL_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        numPulsesL: { label: 'Number of pulses', units: '', 
            defaultVal: 3, minVal: 0, maxVal: 100 },
        pulseCStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 400, minVal: 0, maxVal: tMax / 1e-3 },
        pulseCHeight: { label: 'Stimulus first pulse', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseCSubsequentHeight: { label: 'Stimulus subsequent pulses', units: '', 
            defaultVal: 0.05, minVal: -1000, maxVal: 1000 },
        pulseCWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        isiC_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3 },
        numPulsesC: { label: 'Number of pulses', units: '', 
            defaultVal: 3, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsRecruitmentOnly = JSON.parse(JSON.stringify(paramsRecruitmentAndSummation));
    paramsRecruitmentOnly.T0L_ms.defaultVal = 80;
    paramsRecruitmentOnly.TslopeL_ms.defaultVal = 0;
    paramsRecruitmentOnly.T0C_ms.defaultVal = 80;
    paramsRecruitmentOnly.TslopeC_ms.defaultVal = 0;

    layout = [
        ['Longitudinal Neural Input', ['pulseLStart_ms', 'pulseLHeight', 
            'pulseLSubsequentHeight', 'pulseLWidth_ms', 'isiL_ms',
            'numPulsesL']],
        ['Circumferential Neural Input', ['pulseCStart_ms', 'pulseCHeight', 
            'pulseCSubsequentHeight', 'pulseCWidth_ms', 'isiC_ms',
            'numPulsesC']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];

    controlsPanel = document.getElementById('TongueMuscleControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('TongueMuscleData');
    dataPanel.className = 'datapanel';

    LLDataTable = document.createElement('table');
    LLDataTable.className = 'datatable';
    dataPanel.appendChild(LLDataTable);

    LCDataTable = document.createElement('table');
    LCDataTable.className = 'datatable';
    dataPanel.appendChild(LCDataTable);

    ALDataTable = document.createElement('table');
    ALDataTable.className = 'datatable';
    dataPanel.appendChild(ALDataTable);

    ACDataTable = document.createElement('table');
    ACDataTable.className = 'datatable';
    dataPanel.appendChild(ACDataTable);

    inputLDataTable = document.createElement('table');
    inputLDataTable.className = 'datatable';
    dataPanel.appendChild(inputLDataTable);

    inputCDataTable = document.createElement('table');
    inputCDataTable.className = 'datatable';
    dataPanel.appendChild(inputCDataTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, inputL, inputC, muscle,
            prerun, result, LL, LC, AL, AC, inputLData, inputCData,
            plotPanel, plot, title;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        inputL = electrophys.pulseTrain({
            start: params.pulseLStart_ms * 1e-3, 
            width: params.pulseLWidth_ms * 1e-3, 
            baseline: 0.001,
            height: params.pulseLHeight,
            subsequentHeight: params.pulseLSubsequentHeight,
            gap: params.isiL_ms * 1e-3,
            num_pulses: params.numPulsesL
        });

        inputC = electrophys.pulseTrain({
            start: params.pulseCStart_ms * 1e-3, 
            width: params.pulseCWidth_ms * 1e-3, 
            baseline: 0.001,
            height: params.pulseCHeight,
            subsequentHeight: params.pulseCSubsequentHeight,
            gap: params.isiC_ms * 1e-3,
            num_pulses: params.numPulsesC
        });

        muscle = electrophys.tongueMuscle(model, {
            LLinit: 3.08041, // cm
            ALinit: 0.00063,
            ACinit: 0.00027,
            inputL: inputL,
            inputC: inputC
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
        
        LL         = result.mapOrderedPairs(muscle.LL);
        LC         = result.mapOrderedPairs(muscle.LC);
        AL         = result.mapOrderedPairs(muscle.AL);
        AC         = result.mapOrderedPairs(muscle.AC);
        inputLData = result.mapOrderedPairs(inputL);
        inputCData = result.mapOrderedPairs(inputC);

        console.log(LL);
        console.log(LC);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        LL         = LL.map         (function (l) {return [l[0] / 1e-3, l[1]];});
        LC         = LC.map         (function (l) {return [l[0] / 1e-3, l[1]];});
        AL         = AL.map         (function (a) {return [a[0] / 1e-3, a[1]];});
        AC         = AC.map         (function (a) {return [a[0] / 1e-3, a[1]];});
        inputLData = inputLData.map (function (i) {return [i[0] / 1e-3, i[1]];});
        inputCData = inputCData.map (function (i) {return [i[0] / 1e-3, i[1]];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('TongueMusclePlots');
        plotPanel.innerHTML = '';

        // Longitudinal length
        title = document.createElement('h4');
        title.innerHTML = 'Longitudinal Length';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'LLPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('LLPlot', [LL], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Length (cm)'},
                },
                series: [
                    {label: 'Length', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#LLPlot', LLDataTable, 'Longitudinal Length', 'Time');
        graphJqplot.bindCursorTooltip('#LLPlot', 'Time', 'ms', 'cm');

        // Circumferential length
        title = document.createElement('h4');
        title.innerHTML = 'Circumferential Length';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'LCPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('LCPlot', [LC], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Length (cm)'},
                },
                series: [
                    {label: 'Length', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#LCPlot', LCDataTable, 'Circumferential Length', 'Time');
        graphJqplot.bindCursorTooltip('#LCPlot', 'Time', 'ms', 'cm');

        // Longitudinal activation
        title = document.createElement('h4');
        title.innerHTML = 'Longitudinal Activation';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'ALPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('ALPlot', [AL], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Activation'},
                },
                series: [
                    {label: 'Activation', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#ALPlot', ALDataTable, 'Longitudinal Activation', 'Time');
        graphJqplot.bindCursorTooltip('#ALPlot', 'Time', 'ms', '');

        // Circumferential activation
        title = document.createElement('h4');
        title.innerHTML = 'Circumferential Activation';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'ACPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('ACPlot', [AC], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Activation'},
                },
                series: [
                    {label: 'Activation', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#ACPlot', ACDataTable, 'Circumferential Activation', 'Time');
        graphJqplot.bindCursorTooltip('#ACPlot', 'Time', 'ms', '');

        // Longitudinal neural input
        title = document.createElement('h4');
        title.innerHTML = 'Longitudinal Neural Input';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'inputLPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('inputLPlot', [inputLData], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Neural Input'},
                },
                series: [
                    {label: 'Neural Input', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#inputLPlot', inputLDataTable, 'Longitudinal Neural Input', 'Time');
        graphJqplot.bindCursorTooltip('#inputLPlot', 'Time', 'ms', '');

        // Circumferential neural input
        title = document.createElement('h4');
        title.innerHTML = 'Circumferential Neural Input';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'inputCPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('inputCPlot', [inputCData], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Neural Input'},
                },
                series: [
                    {label: 'Neural Input', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#inputCPlot', inputCDataTable, 'Circumferential Neural Input', 'Time');
        graphJqplot.bindCursorTooltip('#inputCPlot', 'Time', 'ms', '');
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
        LLDataTable.innerHTML = '';
        LLDataTable.style.display = 'none';

        LCDataTable.innerHTML = '';
        LCDataTable.style.display = 'none';

        ALDataTable.innerHTML = '';
        ALDataTable.style.display = 'none';

        ACDataTable.innerHTML = '';
        ACDataTable.style.display = 'none';

        inputLDataTable.innerHTML = '';
        inputLDataTable.style.display = 'none';

        inputCDataTable.innerHTML = '';
        inputCDataTable.style.display = 'none';
    }


    (document.getElementById('TongueMuscleRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('TongueMuscleRecruitmentAndSummationSimButton')
        .addEventListener('click', resetToRecruitmentAndSummationSim, false));
    (document.getElementById('TongueMuscleRecruitmentOnlySimButton')
        .addEventListener('click', resetToRecruitmentOnlySim, false));
    (document.getElementById('TongueMuscleClearDataButton')
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
