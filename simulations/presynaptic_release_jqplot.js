/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true,
componentModel: true */

// Wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

	var paramsBinomial, paramsPoisson, paramsDrugA, paramsDrugB,
		layoutBinomial, layoutPoisson, layoutDrugs, 
		controlsPanel, controls,
		method = 'binomial', drug = 'none',
		dataPanel, pspDataTable, mpspDataTable, alphaDataTable,
		plotHandles = [];

    // Set up the controls for the presynaptic release simulation
	// Parameter values
    paramsBinomial = {
		maxQuanta: { label: 'Maximum Potential Quanta (n)', units: '',
			defaultVal: 100, minVal: 1, maxVal: 10000},
		releaseProb: { label: 'Release Probability (p)', units: '',
			defaultVal: .035, minVal: 0, maxVal: 1},
		meanQuantaSize: { label: 'Mean Quantal Size (q)', units: 'mV',
			defaultVal: 10, minVal: -1000, maxVal: 1000},
		quantaCV: { label: 'CV of Quanta Size', units: '',
			defaultVal: .5, minVal: 0, maxVal: 10},
		numStim: { label: 'Number of Stimuli', units: '',
			defaultVal: 10000, minVal: 100, maxVal: 1000000}
	};
	
	paramsPoisson = {
		meanQuanta: { label: 'Mean Number of Quanta (m)', units: '',
			defaultVal: 3.5, minVal: 1, maxVal: 100 },
		meanQuantaSize: { label: 'Mean Quantal Size (q)', units: 'mV',
			defaultVal: 10, minVal: 1, maxVal: 100 },
		quantaCV: { label: 'CV of Quanta Size', units: '',
			defaultVal: .5, minVal: 0, maxVal: 10 },
		numStim: { label: 'Number of Stimuli', units: '',
			defaultVal: 10000, minVal: 100, maxVal: 1000000}
    };

	paramsDrugA = {
		meanQuanta: {defaultVal: 1},
		meanQuantaSize: {defaultVal: 10},
		quantaCV: {defaultVal: .5},
		numStim: { label: 'Number of Stimuli', units: '',
			defaultVal: 100000, minVal: 100, maxVal: 1000000}
    };
	
	paramsDrugB = {
		meanQuanta: { defaultVal: 3.5},
		meanQuantaSize: { defaultVal: 5},
		quantaCV: { defaultVal: .5},
		numStim: { label: 'Number of Stimuli', units: '',
			defaultVal: 100000, minVal: 100, maxVal: 1000000}
    };

	// Screen layouts
    layoutBinomial = [
        ['Presynaptic Settings', ['maxQuanta', 'releaseProb', 'meanQuantaSize', 'quantaCV']],
		['Simulation Settings', ['numStim']]
    ];
	
	layoutPoisson = [
        ['Presynaptic Settings', ['meanQuanta', 'meanQuantaSize', 'quantaCV']],
		['Simulation Settings', ['numStim']]
    ];
	
	layoutDrugs = [
		['Simulation Settings', ['numStim']]
	];

    controlsPanel = document.getElementById('PresynapticReleaseControls');

    // Prepare tables for displaying captured data points
    dataPanel = document.getElementById('PresynapticReleaseData');
    dataPanel.className = 'datapanel';

    pspDataTable = document.createElement('table');
    pspDataTable.className = 'datatable';
    dataPanel.appendChild(pspDataTable);

    mpspDataTable = document.createElement('table');
    mpspDataTable.className = 'datatable';
    dataPanel.appendChild(mpspDataTable);

    alphaDataTable = document.createElement('table');
    alphaDataTable.className = 'datatable';
    dataPanel.appendChild(alphaDataTable);

	// Run the simulation
    function runSimulation() {
		var params, plot, plotPanel, title;
		var quanta = new Array;
		var nonZero = new Array;
		var counter = 0;

		// Generate the quanta using chosen method
		params = controls.values;
		if (method == 'poisson') {
			for (var i = 0; i < params.numStim; i++) {
				quanta[i] = stats.randomPoisson(params.meanQuanta);
				if (quanta[i] > 0) {
					nonZero[counter] = quanta[i];
					counter++;
				}
			}
		}
		else {
			for (var j = 0; j < params.numStim; j++) {
				quanta[j] = stats.randomBinomial(params.maxQuanta , params.releaseProb);
					if (quanta[j] > 0) {
					nonZero[counter] = quanta[j];
					counter++;
					}
				}
			}

		// Generate MPSPs
		var normalDist = new Array;
		var mpsps = new Array;
		var mpspCount = 0;
		
		for (var i = 0; i < 1000; i++) {
			mpsps[i] = stats.randomNormal(params.meanQuantaSize, params.meanQuantaSize * params.quantaCV);
			if (mpsps[i] < 0) {
				mpsps[i] = 0;
			}	
		}

		// Generate PSPs
		var psps = new Array;
		var normalDist2 = new Array;
		for (var i = 0; i < params.numStim; i++) {
			normalDist2[i] = stats.randomNormal(0, params.meanQuantaSize * params.quantaCV);
			psps[i] = 0;
			if (quanta[i] > 0) {
				psps[i] = params.meanQuantaSize * quanta[i] + normalDist2[i] * Math.sqrt(quanta[i]);
				if (psps[i] < 0) {
						psps[i] = 0;
				}
			}
		}
		
		// Alpha functions
		var alphaData = [],
			singlePSPnumber = 8,
            largestPSP = 0,
            t, y;
			
        for (i = 0; i < singlePSPnumber; i++) {
            if (psps[i] > largestPSP) {
                largestPSP = psps[i]
            }
        }

		for (i = 0; i < singlePSPnumber; i++) {
			var curveData = [];
			for (j = 0; j < 300; j++) {
				t = -10 +.1 * j;
				if (t < 0) {
					y = i * 1.1;
				}
				else {
					if (largestPSP != 0) {
						y = psps[i] / (largestPSP * 0.367879) * t * Math.exp(-t) + i * 1.1;
					}
					else {
						y = psps[i] * t * Math.exp(-t) + i * 1.1;
					}		
				}
				curveData.push([t,y]);
			}
			alphaData.push(curveData);
		}
		


		// Free resources from old plots
		while (plotHandles.length > 0) {
			plotHandles.pop().destroy();
		}

		// Plot the results
		plotPanel = document.getElementById('PresynapticReleasePlots');
		plotPanel.innerHTML = '';

		// Plot the alpha function
		title = document.createElement('h4');
		title.innerHTML = 'Individual postsynaptic potentials (PSPs)';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);
		
		plot = document.createElement('div');
		plot.id = 'individualPSPPlot';
		plot.style.width = '480px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
			$.jqplot('individualPSPPlot', alphaData, jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label: "Time",
						min: -10, max: 20},
					yaxis: {label: "PSP (mV)",
						min:-.5, max: singlePSPnumber * 1.1 + 0.5}},
				grid: {drawGridlines: false},
				axesDefaults: {showTicks: false},
				cursor: {
                    zoom: false,
                    showTooltip: false,
                    showVerticalLine: false
                },
				
		})));
		
		// Plot the PSPs
		title = document.createElement('h4');
		title.innerHTML = 'Postsynaptic potentials (PSPs)';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);

		var pspPlotData, pspBinNumber;
		pspBinNumber = Math.min(75, Math.round(1 + Math.sqrt(params.numStim / 3)));
		pspPlotData = graphJqplot.histFormat(pspBinNumber, psps);
		plot = document.createElement('div');
		plot.id = 'pspPlot';
		plot.style.width = '480px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
			$.jqplot('pspPlot', [pspPlotData], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				seriesDefaults:{
					renderer:$.jqplot.BarRenderer,
					rendererOptions: {barMargin: 1},
					shadow: false,},
				series:[
					{label:'Number of PSPs'}],
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						tickRenderer: $.jqplot.CanvasAxisTickRenderer,
						label: "PSP Size (mV)",
						tickOptions: {
							showGridline: false,
							angle: 90}},
					yaxis: {label: "Number of PSPs"}},
				cursor: {
                    zoom: false,
                    showTooltip: false,
                    showVerticalLine: false
                },
				
		})));
		graphJqplot.bindBarChartDataCapture('#pspPlot', pspPlotData, pspDataTable, 'Postsynaptic potentials (PSPs)', 'PSP Size (mV)', 'Number of PSPs');

		// Plot the MPSPs
        title = document.createElement('h4');
        title.innerHTML = 'Miniature postsynaptic potentials (mPSPs)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
		
		var mpspPlotData;
		mpspPlotData = graphJqplot.histFormat(10, mpsps);
        plot = document.createElement('div');
        plot.id = 'mpspPlot';
        plot.style.width = '480px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
			$.jqplot('mpspPlot', [mpspPlotData], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				seriesDefaults:{
					renderer:$.jqplot.BarRenderer,
					rendererOptions: {barMargin: 1},
					shadow: false},
				series:[
					{label:'Number of mPSPs'}],
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						label: "mPSP Size (mV)",
						tickOptions: {showGridline: false}},
					yaxis: {label: "Number of mPSPs"}},
				cursor: {
                    zoom: false,
                    showTooltip: false,
                    showVerticalLine: false
                },
						
		})));	
		graphJqplot.bindBarChartDataCapture('#mpspPlot', mpspPlotData, mpspDataTable, 'Miniature postsynaptic potentials (mPSPs)', 'mPSP Size (mV)', 'Number of mPSPs');
	

		return;
    }
    
	function reset() {
        controlsPanel.innerHTML = '';
		if (method == 'poisson') {
			if (drug == 'drug A') {
				controls = simcontrols.controls(controlsPanel, paramsDrugA, layoutDrugs);
			}
			else if (drug == 'drug B') {
				controls = simcontrols.controls(controlsPanel, paramsDrugB, layoutDrugs);
			}
			else {
				controls = simcontrols.controls(controlsPanel, paramsPoisson, layoutPoisson);
			}
		}
		else {
			controls = simcontrols.controls(controlsPanel, paramsBinomial, layoutBinomial);
		}
        runSimulation();
    }

	function resetToBinomial() {
		method = 'binomial';
		drug = 'none';
		reset();
	}

	function resetToPoisson() {
		method = 'poisson';
		drug = 'none';
		reset();
	}
	
	function resetToDrugA() {
		method = 'poisson';
		drug = 'drug A';
		reset()
	}
	
	function resetToDrugB() {
		method = 'poisson';
		drug = 'drug B'
		reset();
	}

    function clearDataTables() {
        pspDataTable.innerHTML = '';
        pspDataTable.style.display = 'none';

        mpspDataTable.innerHTML = '';
        mpspDataTable.style.display = 'none';

        alphaDataTable.innerHTML = '';
        alphaDataTable.style.display = 'none';
    }


    (document.getElementById('PassiveMembraneRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('PassiveMembraneClearDataButton')
        .addEventListener('click', clearDataTables, false));
	(document.getElementById('PresynapticReleaseResetButton')
		.addEventListener('click', reset, false));
    (document.getElementById('PresynapticReleasePoissonButton')
        .addEventListener('click', resetToPoisson, false));
	(document.getElementById('PresynapticReleaseBinomialButton')
        .addEventListener('click', resetToBinomial, false));
	(document.getElementById('DrugAButton')
        .addEventListener('click', resetToDrugA, false));
	(document.getElementById('DrugBButton')
        .addEventListener('click', resetToDrugB, false));


    // make the enter key run the simulation
    controlsPanel.addEventListener('keydown',
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    resetToBinomial();
    clearDataTables();

}, false);
