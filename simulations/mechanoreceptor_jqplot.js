/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layoutMerkel, layoutMeissner, layoutBoth,
		controlsPanel, controls, dataPanel, 
		merkelVoltageDataTable, meissnerVoltageDataTable,
		touchDataTable, merkelCurrentDataTable, meissnerCurrentDataTable,
        tMax = 600000e-3, 
		simType = 'merkel',
        plotHandles = [];

    // set up the controls for the passive membrane simulation
    params = { 
		sigHeight1: { label: 'Maximum pressure', units: 'N',
			defaultVal: 8, minVal: 0, maxVal: 20},
		midpointUp1: { label: 'Stimulus start', units: 'ms',
			defaultVal: 50, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown1: { label: 'Stimulus end', units: 'ms',
			defaultVal: 200, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp1: { label: 'Applied pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown1: { label: 'Removed pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		sigHeight2: { label: 'Maximum pressure', units: 'N',
			defaultVal: 8, minVal: 0, maxVal: 20},
		midpointUp2: { label: 'Stimulus start', units: 'ms',
			defaultVal: 300, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown2: { label: 'Stimulus end', units: 'ms',
			defaultVal: 400, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp2: { label: 'Applied pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown2: { label: 'Removed pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		sigHeight3: { label: 'Maximum pressure', units: 'N',
			defaultVal: 8, minVal: 0, maxVal: 20},
		midpointUp3: { label: 'Stimulus start', units: 'ms',
			defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3},
		midpointDown3: { label: 'Stimulus end', units: 'ms',
			defaultVal: 600, minVal: 0, maxVal: tMax / 1e-3},
		growthRateUp3: { label: 'Applied pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
		growthRateDown3: { label: 'Removed pressure time constant', units: 'ms',
			defaultVal: 4, minVal: 0, maxVal: 300},
			
		merkel_Ks: { label: 'Static gain', units: '',
			defaultVal: .02, minVal: 0, maxVal: 1},
		merkel_Kd_positive: { label: 'Positive dynamic gain', units: '',
			defaultVal: .0014, minVal: 0, maxVal: 1},
		merkel_Kd_negative: { label: 'Negative dynamic gain', units: '',
			defaultVal: 0, minVal: -1, maxVal: 1},
			
		meissner_Ks: { label: 'Static gain', units: '',
			defaultVal: 0, minVal: 0, maxVal: 20},
		meissner_Kd_positive: { label: 'Positive dynamic gain', units: '',
			defaultVal: .0016, minVal: 0, maxVal: 1},
		meissner_Kd_negative: { label: 'Negative dynamic gain', units: '',
			defaultVal: -.0016, minVal: -1, maxVal: 1},
			
		merkel_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        merkel_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        merkel_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        merkel_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
			
		meissner_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        meissner_C_nF: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        meissner_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        meissner_E_leak_mV: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
			
		merkel_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        merkel_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        merkel_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
        
		meissner_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        meissner_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        meissner_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
			
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 700, minVal: 0, maxVal: tMax / 1e-3 }
    };
	

	layoutMerkel = [
			['Merkel Cell Properties', ['merkel_V_init_mV', 'merkel_C_nF', 'merkel_g_leak_uS', 'merkel_E_leak_mV',
				'merkel_theta_ss_mV', 'merkel_theta_r_mV', 'merkel_theta_tau_ms']],
			['First Touch Stimulus Properties', ['sigHeight1', 'midpointUp1', 'midpointDown1', 'growthRateUp1', 'growthRateDown1']],
			['Second Touch Stimulus Properties', ['sigHeight2', 'midpointUp2', 'midpointDown2', 'growthRateUp2', 'growthRateDown2']],
			['Third Touch Stimulus Properties', ['sigHeight3', 'midpointUp3', 'midpointDown3', 'growthRateUp3', 'growthRateDown3']],
			['Simulation Settings', ['totalDuration_ms']],
		];
	
	layoutMeissner = [
		['Meissner Corpuscule Properties', ['meissner_V_init_mV', 'meissner_C_nF', 'meissner_g_leak_uS', 'meissner_E_leak_mV',
			'meissner_theta_ss_mV', 'meissner_theta_r_mV', 'meissner_theta_tau_ms']],
		['First Touch Stimulus Properties', ['sigHeight1', 'midpointUp1', 'midpointDown1', 'growthRateUp1', 'growthRateDown1']],
		['Second Touch Stimulus Properties', ['sigHeight2', 'midpointUp2', 'midpointDown2', 'growthRateUp2', 'growthRateDown2']],
		['Third Touch Stimulus Properties', ['sigHeight3', 'midpointUp3', 'midpointDown3', 'growthRateUp3', 'growthRateDown3']],
		['Simulation Settings', ['totalDuration_ms']],
	];
	
	layoutBoth = [
		['Merkel Cell Properties', ['merkel_V_init_mV', 'merkel_C_nF', 'merkel_g_leak_uS', 'merkel_E_leak_mV',
			'merkel_theta_ss_mV', 'merkel_theta_r_mV', 'merkel_theta_tau_ms']],
		['Meissner Corpuscule Properties', ['meissner_V_init_mV', 'meissner_C_nF', 'meissner_g_leak_uS', 'meissner_E_leak_mV',
			'meissner_theta_ss_mV', 'meissner_theta_r_mV', 'meissner_theta_tau_ms']],
		['First Touch Stimulus Properties', ['sigHeight1', 'midpointUp1', 'midpointDown1', 'growthRateUp1', 'growthRateDown1']],
		['Second Touch Stimulus Properties', ['sigHeight2', 'midpointUp2', 'midpointDown2', 'growthRateUp2', 'growthRateDown2']],
		['Third Touch Stimulus Properties', ['sigHeight3', 'midpointUp3', 'midpointDown3', 'growthRateUp3', 'growthRateDown3']],
		['Merkel Cell Current Properties', ['merkel_Ks', 'merkel_Kd_positive', 'merkel_Kd_negative']],
		['Meissner Cell Current Properties', ['meissner_Ks', 'meissner_Kd_positive', 'meissner_Kd_negative']],
		['Simulation Settings', ['totalDuration_ms']],
	];

    controlsPanel = document.getElementById('MechanoreceptorControls');

	
    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MechanoreceptorData');
    dataPanel.className = 'datapanel';

    merkelVoltageDataTable = document.createElement('table');
    merkelVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(merkelVoltageDataTable);
	
	meissnerVoltageDataTable = document.createElement('table');
    meissnerVoltageDataTable.className = 'datatable';
    dataPanel.appendChild(meissnerVoltageDataTable);
	
	touchDataTable = document.createElement('table');
    touchDataTable.className = 'datatable';
    dataPanel.appendChild(touchDataTable);

    merkelCurrentDataTable = document.createElement('table');
    merkelCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(merkelCurrentDataTable);
	
	meissnerCurrentDataTable = document.createElement('table');
    meissnerCurrentDataTable.className = 'datatable';
    dataPanel.appendChild(meissnerCurrentDataTable);


    function runSimulation() {
        var params, plot, plotPanel, title, model,
			merkelCell, merkelTouchCurrent,
			meissnerCorpuscule, meissnerTouchCurrent,
			merkel_v_mech, merkel_v_mV, 
			meissner_v_mech, meissner_v_mV,
			merkel_iStim, merkel_iStim_nA, 
			meissner_iStim, meissner_iStim_nA,
			touchStim, touchStim_N,
            result,
            t0, y0;
       
        params = controls.values;
		model = componentModel.componentModel();
		
		// Create the merkel cell and current
		merkelCell = electrophys.gettingIFNeuron(model, { 
			V_rest: params.merkel_V_init_mV * 1e-3, 
			C: params.merkel_C_nF * 1e-9, 
			g_leak: params.merkel_g_leak_uS * 1e-6, 
			E_leak: params.merkel_E_leak_mV * 1e-3, 
			theta_ss: params.merkel_theta_ss_mV * 1e-3, 
			theta_r: params.merkel_theta_r_mV * 1e-3, 
			theta_tau: params.merkel_theta_tau_ms * 1e-3
		});
		
		merkelTouchCurrent = electrophys.touchStimuli({
			Ks: params.merkel_Ks * 1e-2,
			Kd_positive: params.merkel_Kd_positive * 1e-2,
			Kd_negative: params.merkel_Kd_negative * 1e-2,
			
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
		
		merkelCell.addCurrent(merkelTouchCurrent.pulse);
		
		// Create the meissner corpuscule and current	
		meissnerCorpuscule = electrophys.gettingIFNeuron(model, { 
			V_rest: params.meissner_V_init_mV * 1e-3, 
			C: params.meissner_C_nF * 1e-9, 
			g_leak: params.meissner_g_leak_uS * 1e-6, 
			E_leak: params.meissner_E_leak_mV * 1e-3, 
			theta_ss: params.meissner_theta_ss_mV * 1e-3, 
			theta_r: params.meissner_theta_r_mV * 1e-3, 
			theta_tau: params.meissner_theta_tau_ms * 1e-3

		});
		
		meissnerTouchCurrent = electrophys.touchStimuli({
			Ks: params.meissner_Ks * 1e-2,
			Kd_positive: params.meissner_Kd_positive * 1e-2,
			Kd_negative: params.meissner_Kd_negative * 1e-2,
			
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
		
		meissnerCorpuscule.addCurrent(meissnerTouchCurrent.pulse);
		
		
		// Simulate
		merkel_v_mV = [];
		meissner_v_mV = [];
		touchStim_N = [];
        merkel_iStim_nA = [];
		meissner_iStim_nA = [];
		
		
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
		
		merkel_v_mech = result.mapOrderedPairs(merkelCell.VWithSpikes);
		meissner_v_mech = result.mapOrderedPairs(meissnerCorpuscule.VWithSpikes);
		touchStim = result.mapOrderedPairs(merkelTouchCurrent.force);
		merkel_iStim = result.mapOrderedPairs(merkelTouchCurrent.pulse);
		meissner_iStim = result.mapOrderedPairs(meissnerTouchCurrent.pulse);
		
		
		
		// convert to the right units
		// each ordered pair consists of a time and another variable
		merkel_v_mV = merkel_v_mV.concat(merkel_v_mech.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3]}));
		meissner_v_mV = meissner_v_mV.concat(meissner_v_mech.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3]}));
		touchStim_N = touchStim_N.concat(touchStim.map (function (f) {return [f[0] / 1e-3, f[1] * 1e6]}));
		merkel_iStim_nA = merkel_iStim_nA.concat(merkel_iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
		meissner_iStim_nA = meissner_iStim_nA.concat(meissner_iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
		
		

		
		// free resources from old plots
		while (plotHandles.length > 0) {
			plotHandles.pop().destroy();
		}

		// plot the results
		plotPanel = document.getElementById('MechanoreceptorPlots');
		plotPanel.innerHTML = '';
		
		// Merkel cell voltage
		if (simType != 'meissner') {
			title = document.createElement('h4');
			title.innerHTML = 'Merkel Cell Membrane Potential';
			title.className = 'simplotheading';
			plotPanel.appendChild(title);
			plot = document.createElement('div');
			plot.id = 'merkelVoltagePlot';
			plot.style.width = '425px';
			plot.style.height = '200px';
			plotPanel.appendChild(plot);
			plotHandles.push(
			   $.jqplot('merkelVoltagePlot', [merkel_v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
					axes: {
						xaxis: {label:'Time (ms)'},
						yaxis: {label:'Membrane Potential (mV)'},
					},
					series: [
						{label: 'V<sub>m</sub>', color: 'black'},
					],
			})));
			graphJqplot.bindDataCapture('#merkelVoltagePlot', merkelVoltageDataTable, title.innerHTML, 'Time');
			graphJqplot.bindCursorTooltip('#merkelVoltagePlot', 'Time', 'ms', 'mV');
		}
		
		// Meissner corpuscule voltage
		if (simType != 'merkel') {
			title = document.createElement('h4');
			title.innerHTML = 'Meissner Corpuscule Membrane Potential';
			title.className = 'simplotheading';
			plotPanel.appendChild(title);
			plot = document.createElement('div');
			plot.id = 'meissnerVoltagePlot';
			plot.style.width = '425px';
			plot.style.height = '200px';
			plotPanel.appendChild(plot);
			plotHandles.push(
			   $.jqplot('meissnerVoltagePlot', [meissner_v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
					axes: {
						xaxis: {label:'Time (ms)'},
						yaxis: {label:'Membrane Potential (mV)'},
					},
					series: [
						{label: 'V<sub>m</sub>', color: 'black'},
					],
			})));
			graphJqplot.bindDataCapture('#meissnerVoltagePlot', meissnerVoltageDataTable, title.innerHTML, 'Time');
			graphJqplot.bindCursorTooltip('#meissnerVoltagePlot', 'Time', 'ms', 'mV');
		}
		
		// Touch stimuli
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
					{label: 'Touch force', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#touchStimPlot', touchDataTable, title.innerHTML, 'Time');
		graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'N');
		
		// Merkel cell current
		if (simType != 'meissner') {
			title = document.createElement('h4');
			title.innerHTML = 'Merkel Cell Current';
			title.className = 'simplotheading';
			plotPanel.appendChild(title);
			plot = document.createElement('div');
			plot.id = 'merkelCurrentPlot';
			plot.style.width = '425px';
			plot.style.height = '200px';
			plotPanel.appendChild(plot);
			plotHandles.push(
			   $.jqplot('merkelCurrentPlot', [merkel_iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
					axes: {
						xaxis: {label:'Time (ms)'},
						yaxis: {label:'Current (nA)'},
					},
					series: [
						{label: 'I', color: 'black'},
					],
			})));
			graphJqplot.bindDataCapture('#merkelCurrentPlot', merkelCurrentDataTable, title.innerHTML, 'Time');
			graphJqplot.bindCursorTooltip('#merkelCurrentPlot', 'Time', 'ms', 'nA');
		}
		
		// Meissner corpuscule current
		if (simType != 'merkel') {
			title = document.createElement('h4');
			title.innerHTML = 'Meissner Corpuscule Current';
			title.className = 'simplotheading';
			plotPanel.appendChild(title);
			plot = document.createElement('div');
			plot.id = 'meissnerCurrentPlot';
			plot.style.width = '425px';
			plot.style.height = '200px';
			plotPanel.appendChild(plot);
			plotHandles.push(
			   $.jqplot('meissnerCurrentPlot', [meissner_iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
					axes: {
						xaxis: {label:'Time (ms)'},
						yaxis: {label:'Current (nA)'},
					},
					series: [
						{label: 'I', color: 'black'},
					],
			})));
			graphJqplot.bindDataCapture('#meissnerCurrentPlot', meissnerCurrentDataTable, title.innerHTML, 'Time');
			graphJqplot.bindCursorTooltip('#meissnerCurrentPlot', 'Time', 'ms', 'nA');
		}
	}

   
    function reset(layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }   
	
	function resetToMerkel() {
		simType = 'merkel';
		reset(layoutMerkel);
	}
	
	function resetToMeissner() {
		simType = 'meissner';
		reset(layoutMeissner);
	}
	
	function resetToBoth() {
		simType = 'both';
		reset(layoutBoth);
	}
	

    function clearDataTables() {
        merkelVoltageDataTable.innerHTML = '';
        merkelVoltageDataTable.style.display = 'none';
		
		meissnerVoltageDataTable.innerHTML = '';
        meissnerVoltageDataTable.style.display = 'none';
		
		touchDataTable.innerHTML = '';
        touchDataTable.style.display = 'none';

        merkelCurrentDataTable.innerHTML = '';
        merkelCurrentDataTable.style.display = 'none';
		
		meissnerCurrentDataTable.innerHTML = '';
        meissnerCurrentDataTable.style.display = 'none';
    }


    (document.getElementById('MechanoreceptorRunButton')
        .addEventListener('click', runSimulation, false));
	(document.getElementById('MerkelCellButton')
        .addEventListener('click', resetToMerkel, false));
	(document.getElementById('MeissnerCorpusculeButton')
        .addEventListener('click', resetToMeissner, false));
	(document.getElementById('BothMechanoreceptorsButton')
        .addEventListener('click', resetToBoth, false));		
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

    resetToBoth();
    clearDataTables();

}, false);

