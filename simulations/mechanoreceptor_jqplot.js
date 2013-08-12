/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, 
		controlsPanel, controls, dataPanel, 
		voltageDataTable, touchDataTable, currentDataTable, 
        tMax = 600000e-3, 
        plotHandles = [];

    // set up the controls for the passive membrane simulation
    params = { 
		sigHeight1: { label: 'Sigmoid height', units: '',
			defaultVal: 8, minVal: 0, maxVal: 100},
		midpointUp1: { label: 'Sigmoid midpoint up', units: 'ms',
			defaultVal: 50, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown1: { label: 'Sigmoid midpoint down', units: 'ms',
			defaultVal: 200, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp1: { label: 'Sigmoid growth rate up', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown1: { label: 'Sigmoid growth rate down', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		sigHeight2: { label: 'Sigmoid height', units: '',
			defaultVal: 8, minVal: 0, maxVal: 100},
		midpointUp2: { label: 'Sigmoid midpoint up', units: 'ms',
			defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown2: { label: 'Sigmoid midpoint down', units: 'ms',
			defaultVal: 400, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp2: { label: 'Sigmoid growth rate up', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown2: { label: 'Sigmoid growth rate down', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		sigHeight3: { label: 'Sigmoid height', units: '',
			defaultVal: 8, minVal: 0, maxVal: 100},
		midpointUp3: { label: 'Sigmoid midpoint up', units: 'ms',
			defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown3: { label: 'Sigmoid midpoint down', units: 'ms',
			defaultVal: 600, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp3: { label: 'Sigmoid growth rate up', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown3: { label: 'Sigmoid growth rate down', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		beta: { label: 'Touch current beta', units: '',
			defaultVal: 0, minVal: 0, maxVal: 20},
		Ks: { label: 'Static gain', units: '',
			defaultVal: .02, minVal: 0, maxVal: 20},
		Kd: { label: 'Dynamic gain', units: '',
			defaultVal: .0014, minVal: 0, maxVal: 20},
			
		V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        
		theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
			
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 700, minVal: 0, maxVal: tMax / 1e-3 },
        

    };

    layout = [
		['Mechanoreceptor Properties', ['V_init_mV', 'C_nF', 'g_leak_uS', 'E_leak_mV']],
		['Theta properties', ['theta_ss_mV', 'theta_r_mV', 'theta_tau_ms']],
		['First Touch Stimulus Properties', ['sigHeight1', 'midpointUp1', 'midpointDown1', 'growthRateUp1', 'growthRateDown1']],
		['Second Touch Stimulus Properties', ['sigHeight2', 'midpointUp2', 'midpointDown2', 'growthRateUp2', 'growthRateDown2']],
		['Third Touch Stimulus Properties', ['sigHeight3', 'midpointUp3', 'midpointDown3', 'growthRateUp3', 'growthRateDown3']],
		['Variable Current Properties', ['beta', 'Ks', 'Kd']],
        ['Simulation Settings', ['totalDuration_ms']],
    ];
    controlsPanel = document.getElementById('MechanoreceptorControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MechanoreceptorData');
    dataPanel.className = 'datapanel';

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);
	
	touchDataTable = document.createElement('table');
    touchDataTable.className = 'datatable';
    dataPanel.appendChild(touchDataTable);

    currentDataTable = document.createElement('table');
    currentDataTable.className = 'datatable';
    dataPanel.appendChild(currentDataTable);


    function runSimulation() {
        var params, plot, plotPanel, title, model,
			leakyIF, touchCurrent,
			v_mech, v_mV, 
			iStim, iStim_nA,
			touchStim, touchStim_N,
            result,
            t0, y0;
       
        params = controls.values;
		model = componentModel.componentModel();
		
		// Create the leaky IF neuron and touch stimulus
		leakyIF = electrophys.gettingIFNeuron(model, { 
			V_rest: params.V_init_mV * 1e-3, 
			C: params.C_nF * 1e-9, 
			g_leak: params.g_leak_uS * 1e-6, 
			E_leak: params.E_leak_mV * 1e-3, 
			theta_ss: params.theta_ss_mV * 1e-3, 
			theta_r: params.theta_r_mV * 1e-3, 
			theta_tau: params.theta_tau_ms * 1e-3

		});

		touchCurrent = electrophys.touchStimuli({
			beta: params.beta,
			Ks: params.Ks * 1e-2,
			Kd: params.Kd * 1e-2,
			
			sigHeight1: params.sigHeight1 * 1e-6,
			midpointUp1: params.midpointUp1 * 1e-3,
			midpointDown1: params.midpointDown1 * 1e-3,
			growthRateUp1: params.growthRateUp1 * 1e-3,
			growthRateDown1: params.growthRateDown1 * 1e-3,
			
			sigHeight2: params.sigHeight2 * 1e-6,
			midpointUp2: params.midpointUp2 * 1e-3,
			midpointDown2: params.midpointDown2 * 1e-3,
			growthRateUp2: params.growthRateUp2 * 1e-3,
			growthRateDown2: params.growthRateDown2 * 1e-3,
			
			sigHeight3: params.sigHeight3 * 1e-6,
			midpointUp3: params.midpointUp3 * 1e-3,
			midpointDown3: params.midpointDown3 * 1e-3,
			growthRateUp3: params.growthRateUp3 * 1e-3,
			growthRateDown3: params.growthRateDown3 * 1e-3
		});
		
		leakyIF.addCurrent(touchCurrent.pulse);
		
		
		// Simulate
		v_mV = [];
		touchStim_N = [];
        iStim_nA = [];
		
		// run for a bit to allow the simulation to stabilize
        result = model.integrate({
            tMin: -1.5, 
            tMax: 0, 
            tMaxStep: 16e-3,
        });
        t0 = 0;
        y0 = result.y_f;
        
		
		result = model.integrate({
            tMin: t0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(16e-3, 
                params.totalDuration_ms * 1e-3 / 500),
            y0: y0
        });
		
		v_mech = result.mapOrderedPairs(leakyIF.VWithSpikes);
		touchStim = result.mapOrderedPairs(touchCurrent.force);
		iStim = result.mapOrderedPairs(touchCurrent.pulse);
		
		// convert to the right units
		// each ordered pair consists of a time and another variable
		v_mV = v_mV.concat(v_mech.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3]}));
		touchStim_N = touchStim_N.concat(touchStim.map (function (f) {return [f[0] / 1e-3, f[1] * 1e6]}));
		iStim_nA = iStim_nA.concat(iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));

		
		// free resources from old plots
		while (plotHandles.length > 0) {
			plotHandles.pop().destroy();
		}

		// plot the results
		plotPanel = document.getElementById('MechanoreceptorPlots');
		plotPanel.innerHTML = '';
		
		// Mechanoreceptor voltage
		title = document.createElement('h4');
		title.innerHTML = 'Membrane Potential';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);
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
		graphJqplot.bindDataCapture('#voltagePlot', voltageDataTable, title.innerHTML, 'Time');
		graphJqplot.bindCursorTooltip('#voltagePlot', 'Time', 'ms', 'mV');
		
		// Touch Stimulus
		title = document.createElement('h4');
		title.innerHTML = 'Touch Stimulus';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);
		plot = document.createElement('div');
		plot.id = 'touchStimPlot';
		plot.style.width = '425px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
		   $.jqplot('touchStimPlot', [touchStim_N], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label:'Time (ms)'},
					yaxis: {label:'Touch force (N)'},
				},
				series: [
					{label: 'Touch force (N)', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#touchStimPlot', touchDataTable, title.innerHTML, 'Time');
		graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'N');
		
		// Mechanoreceptor current
		title = document.createElement('h4');
		title.innerHTML = 'Stimulation Current';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);
		plot = document.createElement('div');
		plot.id = 'currentPlot';
		plot.style.width = '425px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
		   $.jqplot('currentPlot', [iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label:'Time (ms)'},
					yaxis: {label:'Current (nA)'},
				},
				series: [
					{label: 'I<sub>stim</sub>', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#currentPlot', currentDataTable, title.innerHTML, 'Time');
		graphJqplot.bindCursorTooltip('#currentPlot', 'Time', 'ms', 'nA');
	}
    

   
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }   

    function clearDataTables() {
        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';
		
		touchDataTable.innerHTML = '';
        touchDataTable.style.display = 'none';

        currentDataTable.innerHTML = '';
        currentDataTable.style.display = 'none';
    }


    (document.getElementById('MechanoreceptorRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MechanoreceptorResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('MechanoreceptorClearDataButton')
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

