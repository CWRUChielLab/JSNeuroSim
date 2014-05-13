/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsRecruitmentAndSummation, paramsRecruitmentOnly, paramsNoInput,
        layout, controlsPanel, controls, dataPanel, animationPanel,
        LLDataTable, LCDataTable, ALDataTable, ACDataTable, inputLDataTable,
        inputCDataTable, tMax = 50000e-3, plotHandles = [];

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
            defaultVal: 180, minVal: 0, maxVal: tMax / 1e-3 },
        pulseLRise_ms: { label: 'Stimulus rise time', units: 'ms', 
            defaultVal: 360, minVal: 0, maxVal: tMax / 1e-3 },
        pulseLFall_ms: { label: 'Stimulus fall time', units: 'ms', 
            defaultVal: 140, minVal: 0, maxVal: tMax / 1e-3 },
        pulseLBaseline: { label: 'Stimulus baseline', units: '',
            defaultVal: 0, minVal: 0, maxVal: 1 },
        pulseLHeight: { label: 'Stimulus first pulse', units: '', 
            defaultVal: 0.05, minVal: 0, maxVal: 1 },
        pulseLSubsequentHeight: { label: 'Stimulus subsequent pulses', units: '', 
            defaultVal: 0.05, minVal: 0, maxVal: 1 },
        isiL_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 280, minVal: 0, maxVal: tMax / 1e-3 },
        numPulsesL: { label: 'Number of pulses', units: '', 
            defaultVal: 3, minVal: 0, maxVal: 1000 },
        pulseCStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 0, minVal: 0, maxVal: tMax / 1e-3 },
        pulseCRise_ms: { label: 'Stimulus rise time', units: 'ms', 
            defaultVal: 260, minVal: 0, maxVal: tMax / 1e-3 },
        pulseCFall_ms: { label: 'Stimulus fall time', units: 'ms', 
            defaultVal: 260, minVal: 0, maxVal: tMax / 1e-3 },
        pulseCBaseline: { label: 'Stimulus baseline', units: '',
            defaultVal: 0, minVal: 0, maxVal: 1 },
        pulseCHeight: { label: 'Stimulus first pulse', units: '', 
            defaultVal: 0.5, minVal: 0, maxVal: 1 },
        pulseCSubsequentHeight: { label: 'Stimulus subsequent pulses', units: '', 
            defaultVal: 0.5, minVal: 0, maxVal: 1 },
        isiC_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 260, minVal: 0, maxVal: tMax / 1e-3 },
        numPulsesC: { label: 'Number of pulses', units: '', 
            defaultVal: 3, minVal: 0, maxVal: 1000 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2500, minVal: 0, maxVal: tMax / 1e-3 }
    };

    paramsRecruitmentOnly = JSON.parse(JSON.stringify(paramsRecruitmentAndSummation));
    paramsNoInput = JSON.parse(JSON.stringify(paramsRecruitmentAndSummation));

    paramsRecruitmentOnly.T0L_ms.defaultVal = 80;
    paramsRecruitmentOnly.TslopeL_ms.defaultVal = 0;
    paramsRecruitmentOnly.T0C_ms.defaultVal = 80;
    paramsRecruitmentOnly.TslopeC_ms.defaultVal = 0;

    paramsNoInput.pulseLBaseline.defaultVal = 0;
    paramsNoInput.pulseLHeight.defaultVal = 0;
    paramsNoInput.pulseLSubsequentHeight.defaultVal = 0;
    paramsNoInput.pulseCBaseline.defaultVal = 0;
    paramsNoInput.pulseCHeight.defaultVal = 0;
    paramsNoInput.pulseCSubsequentHeight.defaultVal = 0;

    layout = [
        ['Neural Input for Longitudinal Muscle', ['pulseLStart_ms', 'pulseLRise_ms',
            'pulseLFall_ms', 'pulseLBaseline', 'pulseLHeight', 'pulseLSubsequentHeight',
            'isiL_ms', 'numPulsesL']],
        ['Neural Input for Circumferential Muscle', ['pulseCStart_ms', 'pulseCRise_ms',
            'pulseCFall_ms', 'pulseCBaseline', 'pulseCHeight', 'pulseCSubsequentHeight',
            'isiC_ms', 'numPulsesC']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];

    controlsPanel = document.getElementById('TongueControls');

    // prepare tables for displaying captured data points

    dataPanel = document.getElementById('TongueData');
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
    
    // Tongue animation    
    animationPanel = document.getElementById('TongueAnimation');
    var tonguePositionX = 10,
        tonguePositionY = 5,
        tongueLengthInit = 200,
        tongueDiameterInit = 70,
        tongueCornerRadius = 20, 
        
        timeMarkerXInit = 585,
        timeMarkerXFinal = 990,
        timeMarkerY = 80,
        timeMarkerEllipseWidth = 3,
        timeMarkerEllipseHeight = 8,
        seconds = 100,
        
        paper = Raphael(animationPanel, 1000, 90),
        tongue = paper.rect(tonguePositionX, tonguePositionY, tongueLengthInit, tongueDiameterInit, tongueCornerRadius),    
        timeMarker = paper.ellipse(timeMarkerXInit, timeMarkerY, timeMarkerEllipseWidth, timeMarkerEllipseHeight),
        tongueLength = [1], 
        tongueDiameter = [1],
        timeMarkerX = [timeMarkerXInit, timeMarkerXFinal];
        
    tongue.attr("fill", "red");
    tongue.attr("stroke", "black");
    timeMarker.attr("fill", "black");

    
    // Animation functions
    var tongueLengthChange = function (size, target, seconds = 10, style = 'linear') {
            var firstTongueWidth = size.shift(),
                newTongueWidth = [firstTongueWidth];
            newTongueWidth = size.concat(newTongueWidth);
            size = [firstTongueWidth].concat(tongueLength);
            tongue.animate({width: size[0]}, seconds, function(){tongueLengthChange(newTongueWidth, target, seconds, style)});
        },
        tongueDiameterChange = function (size, target, seconds = 10, style = 'linear') {
            var firstTongueDiameter = size.shift(),
                newTongueDiameter = [firstTongueDiameter];
            newTongueDiameter = size.concat(newTongueDiameter);
            size = [firstTongueDiameter].concat(tongueDiameter);
            tongue.animate({height: size[0]}, seconds, function(){tongueDiameterChange(newTongueDiameter, target, seconds, style)});
        },
        timeMarkerChange = function (location, target, seconds, style = 'linear') {
            var firstTimeMarkerX = location.shift(),
                newTimeMarkerX = [firstTimeMarkerX];
            newTimeMarkerX = location.concat(newTimeMarkerX);
            location = [firstTimeMarkerX].concat(timeMarkerX);
            timeMarker.animate({cx: location[0]}, seconds, function(){timeMarkerChange(newTimeMarkerX, target, seconds, style)});
        };
        

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, inputL, inputC, muscle,
            prerun, result, LL, LC, AL, AC, inputLData, inputCData,
            plotPanel, plot, title;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        inputL = electrophys.trianglePulseTrain({
            start: params.pulseLStart_ms * 1e-3, 
            risetime: params.pulseLRise_ms * 1e-3, 
            falltime: params.pulseLFall_ms * 1e-3,
            baseline: params.pulseLBaseline + 0.0001, // prevent division by zero
            height: params.pulseLHeight,
            subsequentHeight: params.pulseLSubsequentHeight,
            num_pulses: params.numPulsesL,
            gap: params.isiL_ms * 1e-3,
        });

        inputC = electrophys.trianglePulseTrain({
            start: params.pulseCStart_ms * 1e-3, 
            risetime: params.pulseCRise_ms * 1e-3, 
            falltime: params.pulseCFall_ms * 1e-3,
            baseline: params.pulseCBaseline + 0.0001, // prevent division by zero
            height: params.pulseCHeight,
            subsequentHeight: params.pulseCSubsequentHeight,
            num_pulses: params.numPulsesC,
            gap: params.isiC_ms * 1e-3,
        });

        muscle = electrophys.tongueMuscle(model, {
            LLinit: 3.08041, // cm
            ALinit: 0.00063,
            ACinit: 0.00027,
            inputL: inputL,
            inputC: inputC,
            T0L: params.T0L_ms * 1e-3,
            TslopeL: params.TslopeL_ms * 1e-3,
            T0C: params.T0C_ms * 1e-3,
            TslopeC: params.TslopeC_ms * 1e-3,
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
        
        LL         = result.mapOrderedPairs(muscle.LL);
        LC         = result.mapOrderedPairs(muscle.LC);
        AL         = result.mapOrderedPairs(muscle.AL);
        AC         = result.mapOrderedPairs(muscle.AC);
        inputLData = result.mapOrderedPairs(inputL);
        inputCData = result.mapOrderedPairs(inputC);

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
        plotPanel = document.getElementById('TonguePlots');
        plotPanel.innerHTML = '';

        // Longitudinal length
        title = document.createElement('h4');
        title.innerHTML = 'Length of Longitudinal Muscle (Tongue Length)';
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
        graphJqplot.bindDataCapture('#LLPlot', LLDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#LLPlot', 'Time', 'ms', 'cm');

        // Circumferential length
        title = document.createElement('h4');
        title.innerHTML = 'Length of Circumferential Muscle (Tongue Circumference)';
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
        graphJqplot.bindDataCapture('#LCPlot', LCDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#LCPlot', 'Time', 'ms', 'cm');

//        // Longitudinal activation
//        title = document.createElement('h4');
//        title.innerHTML = 'Longitudinal Muscle Activation';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'ALPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('ALPlot', [AL], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Activation'},
//                },
//                series: [
//                    {label: 'Activation', color: 'black'},
//                ],
//        })));
//        graphJqplot.bindDataCapture('#ALPlot', ALDataTable, title.innerHTML, 'Time');
//        graphJqplot.bindCursorTooltip('#ALPlot', 'Time', 'ms', '');

//        // Circumferential activation
//        title = document.createElement('h4');
//        title.innerHTML = 'Circumferential Muscle Activation';
//        title.className = 'simplotheading';
//        plotPanel.appendChild(title);
//        plot = document.createElement('div');
//        plot.id = 'ACPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('ACPlot', [AC], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Activation'},
//                },
//                series: [
//                    {label: 'Activation', color: 'black'},
//                ],
//        })));
//        graphJqplot.bindDataCapture('#ACPlot', ACDataTable, title.innerHTML, 'Time');
//        graphJqplot.bindCursorTooltip('#ACPlot', 'Time', 'ms', '');

        // Longitudinal neural input
        title = document.createElement('h4');
        title.innerHTML = 'Neural Input for Longitudinal Muscle';
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
        graphJqplot.bindDataCapture('#inputLPlot', inputLDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#inputLPlot', 'Time', 'ms', '');

        // Circumferential neural input
        title = document.createElement('h4');
        title.innerHTML = 'Neural Input for Circumferential Muscle';
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
        graphJqplot.bindDataCapture('#inputCPlot', inputCDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#inputCPlot', 'Time', 'ms', '');
        

        for (var i = 0; i < LL.length; i++) {
          tongueLength[i] = parseInt(100 * LL[i][1]);
          tongueDiameter[i] = parseInt(100 * LC[i][1] / 3.14159);    
        }
        seconds = 10 * tongueLength.length;
        /*for (var i = 0; i < 100; i++) {
          tongueLength.push(tongueLength[tongueLength.length - 1]);
          tongueDiameter.push(tongueDiameter[tongueDiameter.length - 1]);
        }*/
    }

    
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }
    
    function animateTongueLapping() {
        tongueLengthChange(tongueLength, tongue);
        tongueDiameterChange(tongueDiameter, tongue);
        timeMarkerChange(timeMarkerX, timeMarker, seconds);
    }
    
    function stopTongueLapping() {
        document.location.reload(true);
    }


    function resetToRecruitmentAndSummationSim() {
        reset(paramsRecruitmentAndSummation, layout);
    }


    function resetToRecruitmentOnlySim() {
        reset(paramsRecruitmentOnly, layout);
    }


    function resetToNoInputSim() {
        reset(paramsNoInput, layout);
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


    (document.getElementById('TongueRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('TongueLappingButton')
        .addEventListener('click', animateTongueLapping, false));
    (document.getElementById('StopTongueLappingButton')
        .addEventListener('click', stopTongueLapping, false));
    (document.getElementById('TongueRecruitmentAndSummationSimButton')
        .addEventListener('click', resetToRecruitmentAndSummationSim, false));
//    (document.getElementById('TongueRecruitmentOnlySimButton')
//        .addEventListener('click', resetToRecruitmentOnlySim, false));
    (document.getElementById('TongueNoInputSimButton')
        .addEventListener('click', resetToNoInputSim, false));
    (document.getElementById('TongueClearDataButton')
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

