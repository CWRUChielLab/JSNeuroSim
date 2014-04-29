/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var paramsRecruitmentAndSummation, paramsRecruitmentOnly, paramsNoInput,
        layout, controlsPanel, controls, dataPanel, LLDataTable,
        LCDataTable, ALDataTable, ACDataTable, inputLDataTable,
        inputCDataTable, tMax = 50000e-3, plotHandles = [],
        tWidth, tHeight, tCorners, tipWidth, tipHeight, tipX, tipY,
        paper, tongue, tongueTip,
        tongueOut, tipOut, tongueIn, tipIn,
        tWidthChange, tHeightChange, tCornersChange,
        tipWidthChange, tipHeightChange, tipXChange, tipYChange,
        tX, tY, tWidth1, tWidth2, tHeight1, tHeight2, tCorners1, tCorners2,
        tipX1, tipX2, tipY1, tipY2, tipWidth1, tipWidth2, tipHeight1, tipHeight2; 

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
        
        
        // Tongue animation    
        tX = 100;
        tY = 50;
        tWidth1 = 200;
        tWidth2 = 500;
        tHeight1 = 100;
        tHeight2 = 60;
        tCorners1 = 30;
        tCorners2 = 15;
        tipX1 = 280;
        tipX2 = 590;
        tipY1 = 100;
        tipY2 = 80;
        tipWidth1 = 28;
        tipWidth2 = 15;
        tipHeight1 = 48;
        tipHeight2 = 30;

        // Remove old animation objects if they exist
        if (paper !== undefined) {
            paper.remove();
        }
        if (tongue !== undefined) {
            tongue.remove();
        }
        if (tongueTip !== undefined) {
            tongueTip.remove();
        }

        paper = Raphael(0, 1000, 2000, 1000);
        tongue = paper.rect(tX, tY, tWidth1, tHeight1, tCorners1);
        tongueTip = paper.ellipse(tipX1, tipY1, tipWidth1, tipHeight1);

        tWidth = [tWidth1, tWidth2];
        tHeight = [tHeight1, tHeight2];
        tCorners = [tCorners1, tCorners2];
        tipWidth = [tipWidth1, tipWidth2];
        tipHeight = [tipHeight1, tipHeight2];
        tipX = [tipX1, tipX2];
        tipY = [tipY1, tipY2];
            
        tongue.attr("fill", "#f00");
        tongue.attr("stroke", "black");
        tongueTip.attr("fill", "red");
        tongueTip.attr("stroke", "black");
        
        // Animation functions
        tWidthChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTWidth = size.shift(),
                    newTWidth = [firstTWidth];
                newTWidth = tWidth.concat(newTWidth);
                tWidth = [firstTWidth].concat(tWidth);
                target.attr({width: tWidth[0]}).animate({width: tWidth[1]}, seconds, style, function(){tWidthChange(newTWidth, target, seconds, style)});
        };

        tHeightChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTHeight = size.shift(),
                    newTHeight = [firstTHeight];
                newTHeight = tHeight.concat(newTHeight);
                tHeight = [firstTHeight].concat(tHeight);
                target.attr({height: tHeight[0]}).animate({height: tHeight[1]}, seconds, style, function(){tHeightChange(newTHeight, target, seconds, style)});
        };
        
        tCornersChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTCorners = size.shift(),
                    newTCorners = [firstTCorners];
                newTCorners = tCorners.concat(newTCorners);
                tCorners = [firstTCorners].concat(tCorners);
                target.attr({r: tCorners[0]}).animate({r: tCorners[1]}, seconds, style, function(){tCornersChange(newTCorners, target, seconds, style)});
        };
        
        tipWidthChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTipWidth = size.shift(),
                    newTipWidth = [firstTipWidth];
                newTipWidth = tipWidth.concat(newTipWidth);
                tipWidth = [firstTipWidth].concat(tipWidth);
                target.attr({rx: tipWidth[0]}).animate({rx: tipWidth[1]}, seconds, style, function(){tipWidthChange(newTipWidth, target, seconds, style)});
        };
        
        tipHeightChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTipHeight = size.shift(),
                    newTipHeight = [firstTipHeight];
                newTipHeight = tipHeight.concat(newTipHeight);
                tipHeight = [firstTipHeight].concat(tipHeight);
                target.attr({ry: tipHeight[0]}).animate({ry: tipHeight[1]}, seconds, style, function(){tipHeightChange(newTipHeight, target, seconds, style)});
        };
        
        tipXChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTipX = size.shift(),
                    newTipX = [firstTipX];
                newTipX = tipX.concat(newTipX);
                tipX = [firstTipX].concat(tipX);
                target.attr({cx: tipX[0]}).animate({cx: tipX[1]}, seconds, style, function(){tipXChange(newTipX, target, seconds, style)});
        };
        
        tipYChange = function (size, target, seconds = 1000, style = 'linear') {
                var firstTipY = size.shift(),
                    newTipY = [firstTipY];
                newTipY = tipY.concat(newTipY);
                tipY = [firstTipY].concat(tipY);
                target.attr({cy: tipY[0]}).animate({cy: tipY[1]}, seconds, style, function(){tipYChange(newTipY, target, seconds, style)});
        };
            
        tongueOut = Raphael.animation({width: "500", height: "60", r: "15"}, 400);
        tipOut = Raphael.animation({cx: "590", cy: "80", rx: "15", ry: "30"}, 400);
        tongueIn = Raphael.animation({width: "200", height: "100", r: "30"}, 150);
        tipIn = Raphael.animation({cx: "280", cy: "100", rx: "28", ry: "48"}, 150);
        
    }

    
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }
    
    function animateTongueOut() {
        tongue.animate(tongueOut);
        tongueTip.animate(tipOut);
    }
    
    function animateTongueIn() {
        tongue.animate(tongueIn);
        tongueTip.animate(tipIn);
    }
    
    function animateTongueLapping() {
        tWidthChange(tWidth, tongue);
        tHeightChange(tHeight, tongue);
        tCornersChange(tCorners, tongue);
        tipWidthChange(tipWidth, tongueTip);
        tipHeightChange(tipHeight, tongueTip);
        tipXChange(tipX, tongueTip);
        tipYChange(tipY, tongueTip);        
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
    (document.getElementById('TongueOutButton')
        .addEventListener('click', animateTongueOut, false));
    (document.getElementById('TongueInButton')
        .addEventListener('click', animateTongueIn, false));
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

