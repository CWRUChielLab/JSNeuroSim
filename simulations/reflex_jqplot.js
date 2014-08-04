/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
	'use strict';

	var params, layout, controlsPanel, controls, dataPanel,
		lengthDataTable, forceDataTable, spindleVDataTable, alphaMNVDataTable,
		tMax = 10000e-3, plotHandles = [],
		
		// Set up the graphics
		animationPanel = document.getElementById('ReflexAnimation'),
		paper = Raphael(animationPanel, 1000, 450),
		
		startTibiaAngle = -1.36678,		
		tibiaKneeStartX1 = 725, tibiaKneeStartY1 = 165,
		tibiaKneeStartX2 = 775, tibiaKneeStartY2 = 380,
		tibiaLength = Math.sqrt(Math.pow((tibiaKneeStartY2 - tibiaKneeStartY1),2) + Math.pow((tibiaKneeStartX2 - tibiaKneeStartX1), 2)),
		
		boneStrokeWidth = 30,
		tibia = paper.path('M ' + tibiaKneeStartX1 + ' ' + tibiaKneeStartY1 + ' L ' + tibiaKneeStartX2 + ' ' + tibiaKneeStartY2).attr({stroke: '#EED999', 'stroke-width': boneStrokeWidth}),
		
		startFootHeelAngle = -1.41839,
		startFootToesAngle = -1.11832,
		footHeelX1 = 762, footHeelY1 = 396, footToesX1 = 855, footToesY1 = 378, footHeelX2, footHeelY2, footToesX2, footToesY2,
		startFoot = 'M ' + footHeelX1 + ' ' + footHeelY1 + ' L ' + footToesX1 + ' ' + footToesY1,
		endFoot,
		foot = paper.path(startFoot).attr({stroke: '#EED999', 'stroke-width': 24}),
		
		kneeToHeelLength = 310,
		kneeToToesLength = 320,
		
		femur = paper.path('M 410 150 L 700 150').attr({stroke: '#EED999', 'stroke-width': boneStrokeWidth}),
		quadriceps = paper.ellipse(555, 125, 150, 20).attr({fill: '#FF4444', stroke: 'black'}),
		quadricepsEndWidth = 200,
		hamstring = paper.ellipse(545, 175, 140, 20).attr({fill: '#FF4444', stroke: 'black'}),
		
//		spinalCord;
//		jQuery.ajax({
//			type: "GET",
//			url: "../media/spinal_cord.svg",
//			datatype: "xml",
//			success: function(svgXML) {
//				spinalCord = paper.importSVG(svgXML);
//				//spinalCord = spinalCord.attr({opacity: 0.5, stroke: 'red'});
//				spinalCord = spinalCord.transform("t0,-100s0.7,0.7,10,10");
//			}
//		});
//	var
		nerveColorLight = '#ADD8E6',
		nerveColorMid = '#1E90FF',
		nerveColorDark = '#0000CD',
		
		quadricepsToAfferentSynapse = paper.ellipse(240, 70, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		afferentNerve = paper.path('M 240 70 R 280 118 360 135 545 115 L 550 118 555 112 560 118 565 112').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToInterNeuron = paper.path('M 150 60 R 190 30 240 70').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToInterNeuronSynapse = paper.path('M 140 55 L 152 58 L 153 70').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		afferentToMotorNeuron = paper.path('M 160 105 R 163 60 190 30 240 70').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToMotorNeuronSynapse = paper.path('M 150 110 L 160 105 L 168 110').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		
		interToAfferentNeuronSynapse = paper.ellipse(140, 70, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		interNeuron = paper.path('M 140 70 L 140 130').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		interToMotorNerveSynapse = paper.ellipse(140, 130, 3, 3).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		motorToInterNeuronSynapse = paper.ellipse(160, 120, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		motorNerve = paper.path('M 160 120 R 178 188 250 193 272 135 320 140 380 142 440 137 555 133').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		motorNerveToQuadricepsSynapse = paper.path('M 565 125 L 555 133 L 565 140').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		inhibitoryToInterNeuronSynapse = paper.ellipse(140, 145, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		inhibitoryNerve = paper.path('M 140 145 R 155 183 200 205 256 203 285 143 380 172 545 175').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		inhibitoryNerveToHamstringSynapse = paper.path('M 555 167 L 545 175 L 555 183').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		
		patellarTendonPath1 = 'M 705 125 S 710 145 733 87',
		patellarTendonPath2,
		patellarTendonPath3,
		patellarTendon1 = paper.path(patellarTendonPath1).attr({'stroke-width': 3}),
		patellarTendon2 = paper.path(patellarTendonPath2).attr({'stroke-width': 3, opacity: 0}),
		hamstringTendonPath1 = 'M 685 175 S 690 172 698 93',
		hamstringTendonPath2,
		hamstringTendon = paper.path(hamstringTendonPath1).attr({'stroke-width': 2}),  
		
		afferentNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
		interNeuronTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
		motorNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 1}),
		inhibitoryNerveTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 1}),
		afferentToInterNeuronTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
		afferentToMotorNeuronTracker = paper.ellipse(0, 0, 4, 4).attr({stroke: 'black', fill: 'black', opacity: 0}),
		
		scaleFactor = 1,
		defaultLength = 90,
		reflex,
		reflexAngle,
		reflexAngleDeg,
		timeScale = 7,
		
		startHammer = 'M 733 55 L 730 50 L 770 10 L 785 30 Z',
		endHammer = 'M 713 75 L 710 70 L 750 30 L 765 50 Z',
		hammer1 = paper.path(startHammer).attr({'stroke-width': 2}),
		hammer2 = paper.path(endHammer).attr({'stroke-width': 2, opacity: 0});
		
			
	motorNerveTracker.animate({opacity: 0}, 1);
	inhibitoryNerveTracker.animate({opacity: 0}, 1);
		

	// set up the controls
	params = {
		Lstretch_mm: { label: 'Stretch', units: 'mm',
			defaultVal: 5, minVal: 0, maxVal: 10 },
		m_g: { label: 'Mass', units: 'g',
			defaultVal: 8000, minVal: 7000, maxVal: 8500 },
		B_ms_cm: { label: 'Force-velocity constant', units: 'ms/cm',
			defaultVal: 0, minVal: 0, maxVal: 10000.0 },
		beta_g_ms: { label: 'Damping constant', units: 'g/ms',
			defaultVal: 50, minVal: 0, maxVal: 10000.0 },
		Lrestpas_cm: { label: 'Resting position', units: 'cm',
			defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
		c1_mN: { label: 'Passive force multiplier', units: 'mN',
			defaultVal: 0, minVal: 0, maxVal: 10000 },
		activation_tau: { label: 'Activation time constant', units: 'ms',
			defaultVal: 1, minVal: 0.1, maxVal: 10000.0 },

		Lrestspring_cm: { label: 'Spring resting position', units: 'cm',
			defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
		k: { label: 'Spring stiffness', units: 'N/cm',
			defaultVal: 1, minVal: 0, maxVal: 10.0 },

		spindle_Ks: { label: 'Static gain', units: 'nA/mN',
			defaultVal: 0.2, minVal: 0, maxVal: 100},
		spindle_Kd_positive: { label: 'Positive dynamic gain', units: 'pC/mN',
			defaultVal: 14, minVal: 0, maxVal: 10000},
		spindle_Kd_negative: { label: 'Negative dynamic gain', units: 'pC/mN',
			defaultVal: 0, minVal: -10000, maxVal: 10000},
			
		spindle_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
			defaultVal: -48, minVal: -1000, maxVal: 1000 },
		spindle_C_nF: { label: 'Membrane capacitance', units: 'nF', 
			defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
		spindle_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
			defaultVal: .055, minVal: 0.01, maxVal: 100 },
		spindle_E_leak_mV: { label: 'Leak potential', units: 'mV', 
			defaultVal: -48, minVal: -1000, maxVal: 1000 },
			
		spindle_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
			defaultVal: -34, minVal: -1000, maxVal: 1000 },
		spindle_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
			defaultVal: 0, minVal: -1000, maxVal: 1000 },
		spindle_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
			defaultVal: 20, minVal: 0.1, maxVal: 1000000 },

		reflexThreshold_cm: { label: 'Reflex threshold length', units: 'cm',
			defaultVal: 90.0, minVal: 88.0, maxVal: 92.0 },
		reflexConstant_cm: { label: 'Reflex activation length constant', units: 'cm',
			defaultVal: 1e8, minVal: 0.1, maxVal: 1e12 },

		alphaMN_V_init_mV: { label: 'Initial membrane potential', units: 'mV', 
			defaultVal: -50, minVal: -1000, maxVal: 1000 },
		alphaMN_C_nF: { label: 'Membrane capacitance', units: 'nF', 
			defaultVal: 2, minVal: 0.01, maxVal: 100 },
		alphaMN_g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
			defaultVal: 0.05, minVal: 0.01, maxVal: 100 },
		alphaMN_E_leak_mV: { label: 'Leak potential', units: 'mV', 
			defaultVal: -50, minVal: -1000, maxVal: 1000 },
		alphaMN_theta_ss_mV: { label: 'Resting threshold', units: 'mV', 
			defaultVal: -34, minVal: -1000, maxVal: 1000 },
		alphaMN_theta_r_mV: { label: 'Refractory threshold', units: 'mV', 
			defaultVal: 0, minVal: -1000, maxVal: 1000 },
		alphaMN_theta_tau_ms: { label: 'Refractory time constant', units: 'ms', 
			defaultVal: 10, minVal: 0.1, maxVal: 1000000 },

		spindleToAlphaMN_g_uS: { label: 'Synapse conductance', 
			units: '\u00B5S', defaultVal: 0.05, minVal: 0, maxVal: .1 },
		spindleToAlphaMN_E_mV: { label: 'Synapse potential', units: 'mV', 
			defaultVal: 0, minVal: -1000, maxVal: 1000 },
		spindleToAlphaMN_tau_rise_ms: { units: 'ms', 
			label: 'Synapse rise time constant', 
			defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
		spindleToAlphaMN_tau_fall_ms: { units: 'ms', 
			label: 'Synapse fall time constant', 
			defaultVal: 25, minVal: 0.1, maxVal: 1000000 },

		nmj_gain: { label: 'Synapse strength', units: 'mV<sup>-1</sup>',
			defaultVal: 0.01, minVal: 0, maxVal: 100 },

		totalDuration_ms: { label: 'Total duration', units: 'ms', 
			defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 },
	};

	layout = [
		['Muscle Properties', ['Lstretch_mm']],//, 'm_g', 'beta_g_ms', 'activation_tau']],
		//['Spring Properties', ['Lrestspring_cm', 'k']],
		['Spindle Cell Properties', ['spindle_V_init_mV', 'spindle_C_nF', 'spindle_g_leak_uS', 'spindle_E_leak_mV',
			'spindle_theta_ss_mV', 'spindle_theta_r_mV', 'spindle_theta_tau_ms', 'reflexThreshold_cm', 'reflexConstant_cm']],
		['Alpha Motor Neuron Properties', ['alphaMN_V_init_mV', 'alphaMN_C_nF', 'alphaMN_g_leak_uS', 'alphaMN_E_leak_mV',
			'alphaMN_theta_ss_mV', 'alphaMN_theta_r_mV', 'alphaMN_theta_tau_ms']],
		['Spindle to Alpha Synapse Properties', ['spindleToAlphaMN_g_uS', 'spindleToAlphaMN_E_mV',
			'spindleToAlphaMN_tau_rise_ms', 'spindleToAlphaMN_tau_fall_ms']],
		['Neuromuscular Junction Properties', ['nmj_gain']],
		['Simulation Settings', ['totalDuration_ms']]
	];

	controlsPanel = document.getElementById('MuscleControls');

	// prepare tables for displaying captured data points
	dataPanel = document.getElementById('MuscleData');
	dataPanel.className = 'datapanel';

	lengthDataTable = document.createElement('table');
	lengthDataTable.className = 'datatable';
	dataPanel.appendChild(lengthDataTable);

	forceDataTable = document.createElement('table');
	forceDataTable.className = 'datatable';
	dataPanel.appendChild(forceDataTable);

	spindleVDataTable = document.createElement('table');
	spindleVDataTable.className = 'datatable';
	dataPanel.appendChild(spindleVDataTable);

	alphaMNVDataTable = document.createElement('table');
	alphaMNVDataTable.className = 'datatable';
	dataPanel.appendChild(alphaMNVDataTable);

	// simulate and plot an hh neuron with a pulse
	function runSimulation() {
		var params, model, muscle, spindle, alphaMN, synapse,
			result, L, Lprime, spindleV, alphaMNV, force,
			plotPanel, title, plot; 
		
		// create the passive membrane
		params = controls.values;
		model = componentModel.componentModel();

		spindle = electrophys.gettingIFNeuron(model, { 
			V_rest: params.spindle_V_init_mV * 1e-3, 
			C: params.spindle_C_nF * 1e-9, 
			g_leak: params.spindle_g_leak_uS * 1e-6, 
			E_leak: params.spindle_E_leak_mV * 1e-3, 
			theta_ss: params.spindle_theta_ss_mV * 1e-3, 
			theta_r: params.spindle_theta_r_mV * 1e-3, 
			theta_tau: params.spindle_theta_tau_ms * 1e-3
		});

		alphaMN = electrophys.gettingIFNeuron(model, { 
			V_rest: params.alphaMN_V_init_mV * 1e-3, 
			C: params.alphaMN_C_nF * 1e-9, 
			g_leak: params.alphaMN_g_leak_uS * 1e-6, 
			E_leak: params.alphaMN_E_leak_mV * 1e-3, 
			theta_ss: params.alphaMN_theta_ss_mV * 1e-3, 
			theta_r: params.alphaMN_theta_r_mV * 1e-3, 
			theta_tau: params.alphaMN_theta_tau_ms * 1e-3
		});

		synapse = electrophys.gettingSynapse(model, spindle, alphaMN, { 
			W: params.spindleToAlphaMN_g_uS * 1e-6, 
			E_rev: params.spindleToAlphaMN_E_mV * 1e-3, 
			tau_open: params.spindleToAlphaMN_tau_rise_ms * 1e-3, 
			tau_close: params.spindleToAlphaMN_tau_fall_ms * 1e-3, 
		});

		muscle = electrophys.muscleFullDynamics(model, {
			Linit: params.Lrestpas_cm + params.Lstretch_mm / 10,
			m: params.m_g,
			B: params.B_ms_cm * 1e-3,
			beta: params.beta_g_ms * 1e3,
			p: 1 / params.activation_tau * 1e3,
			Lrestspring: params.Lrestspring_cm,
			c1: params.c1_mN * 1e-3,
			Lrestpas: params.Lrestpas_cm,
			k: params.k
		});

		// add proprioception
		spindle.addCurrent(function (state, t) {
			return Math.min(2e-9, Math.max(0, 1/params.reflexConstant_cm * (muscle.L(state, t) - params.reflexThreshold_cm)));
		});

		// add neuromuscular junction
		muscle.setNeuralInput(function (state, t) {
		   return Math.max(0, params.nmj_gain * (alphaMN.V(state, t) * 1e3 - (params.alphaMN_theta_ss_mV)));
		});

		// simulate it
		result = model.integrate({
			tMin: 0, 
			tMax: params.totalDuration_ms * 1e-3, 
			tMaxStep: 1e-3
		});
		
		L		= result.mapOrderedPairs(muscle.L);
		Lprime   = result.mapOrderedPairs(muscle.Lprime);
		force	= result.mapOrderedPairs(muscle.force);
		spindleV = result.mapOrderedPairs(spindle.VWithSpikes);
		alphaMNV = result.mapOrderedPairs(alphaMN.VWithSpikes);

		// convert to the right units
		// each ordered pair consists of a time and another variable
		L		= L.map		(function (l) {return [l[0] / 1e-3, l[1]	   ];});
		Lprime   = Lprime.map   (function (v) {return [v[0] / 1e-3, v[1] / 1e3 ];});
		spindleV = spindleV.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
		alphaMNV = alphaMNV.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];});
		force	= force.map	(function (f) {return [f[0] / 1e-3, f[1] / 1e-3];});

		// free resources from old plots
		while (plotHandles.length > 0) {
			plotHandles.pop().destroy();
		}

		// plot the results
		plotPanel = document.getElementById('MusclePlots');
		plotPanel.innerHTML = '';

		// ******************
		// MUSCLE
		// ******************

		title = document.createElement('h4');
		title.innerHTML = 'Muscle Properties';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);

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
					yaxis: {
						label:'Length (cm)',
						min: 85, max: 95,
					},
				},
				series: [
					{label: 'Length', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#lengthPlot', lengthDataTable, 'Muscle Length', 'Time');
		graphJqplot.bindCursorTooltip('#lengthPlot', 'Time', 'ms', 'cm');

		// Muscle force
		plot = document.createElement('div');
		plot.id = 'forcePlot';
		plot.style.width = '425px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
			$.jqplot('forcePlot', [force], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label:'Time (ms)'},
					yaxis: {label:'Force (mN)'},
				},
				series: [
					{label: 'Force', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#forcePlot', forceDataTable, 'Muscle Force', 'Time');
		graphJqplot.bindCursorTooltip('#forcePlot', 'Time', 'ms', 'mN');

		// ******************
		// SPINDLE
		// ******************

		title = document.createElement('h4');
		title.innerHTML = 'Spindle Fiber Neuron Properties';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);

		// Spindle membrane potential
		plot = document.createElement('div');
		plot.id = 'spindleVPlot';
		plot.style.width = '425px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
			$.jqplot('spindleVPlot', [spindleV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label:'Time (ms)'},
					yaxis: {label:'Membrane Potential (mV)'},
				},
				series: [
					{label: 'V<sub>m</sub>', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#spindleVPlot', spindleVDataTable, 'Spindle Fiber Neuron Membrane Potential', 'Time');
		graphJqplot.bindCursorTooltip('#spindleVPlot', 'Time', 'ms', 'mV');

		// ******************
		// ALPHA MOTOR NEURON
		// ******************

		title = document.createElement('h4');
		title.innerHTML = 'Alpha Motor Neuron Properties';
		title.className = 'simplotheading';
		plotPanel.appendChild(title);

		// Spindle membrane potential
		plot = document.createElement('div');
		plot.id = 'alphaMNVPlot';
		plot.style.width = '425px';
		plot.style.height = '200px';
		plotPanel.appendChild(plot);
		plotHandles.push(
			$.jqplot('alphaMNVPlot', [alphaMNV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
				axes: {
					xaxis: {label:'Time (ms)'},
					yaxis: {label:'Membrane Potential (mV)'},
				},
				series: [
					{label: 'V<sub>m</sub>', color: 'black'},
				],
		})));
		graphJqplot.bindDataCapture('#alphaMNVPlot', alphaMNVDataTable, 'Alpha Motor Neuron Membrane Potential', 'Time');
		graphJqplot.bindCursorTooltip('#alphaMNVPlot', 'Time', 'ms', 'mV');
		
		
		
		
		// Animation calculations
		
		var forceIntegral = 0;
			
		for (var i = 0; i < force.length - 1; i++) {
			forceIntegral += (force[i + 1][1]) * (force[i + 1][0] - force[i][0]);
		}
		
		reflexAngle = (-1.13603 * Math.pow(10, -17)) - (6.82844 * Math.pow(10, -7) * forceIntegral) -
					  (8.54039 * Math.pow(10, -13) * Math.pow(forceIntegral, 2)) - 
					  (5.7811 * Math.pow(10, -19) * Math.pow(forceIntegral, 3));
		reflexAngleDeg = reflexAngle * 360 / (2 * Math.PI);
		//quadricepsEndWidth = 150 - (-forceIntegral / 30000);
		quadricepsEndWidth = 150 - (-forceIntegral / 40000);
		scaleFactor = (params.Lstretch_mm) / (10 * defaultLength);
		
		var patellarTendonLeftX1 = 704,
			patellarTendonLeftY1 = 125,
			patellarTendonMidX1 = 710,
			patellarTendonMidY1 = 135,
			patellarTendonRightX1 = Math.round(tibiaKneeStartX1 + Math.cos(startTibiaAngle + Math.PI / 2) * (boneStrokeWidth / 2)) - 1,
			patellarTendonRightY1 = Math.round(tibiaKneeStartY1 - Math.sin(startTibiaAngle + Math.PI / 2) * (boneStrokeWidth / 2)) + 3,
			
			patellarTendonLeftX2 = 704,
			patellarTendonLeftY2 = 125,
			patellarTendonMidX2 = Math.round(715 - scaleFactor * 900),
			patellarTendonMidY2 = Math.round(145 + scaleFactor * 900),
			patellarTendonRightX2 = Math.round(tibiaKneeStartX1 + Math.cos(startTibiaAngle + Math.PI / 2) * (boneStrokeWidth / 2)),
			patellarTendonRightY2 = Math.round(tibiaKneeStartY1 - Math.sin(startTibiaAngle + Math.PI / 2) * (boneStrokeWidth / 2)) + 3,
			
			patellarTendonLeftX3 = 553 + quadricepsEndWidth,
			patellarTendonLeftY3 = 125,
			patellarTendonMidX3 = 705,
			patellarTendonMidY3 = 118,
			patellarTendonRightX3 = Math.round(tibiaKneeStartX1 + Math.cos(startTibiaAngle + reflexAngle + Math.PI / 2) * (boneStrokeWidth / 2)),
			patellarTendonRightY3 = Math.round(tibiaKneeStartY1 - Math.sin(startTibiaAngle + reflexAngle + Math.PI / 2) * (boneStrokeWidth / 2)) + 3,
			
			hamstringTendonLeftX1 = 683,
			hamstringTendonLeftY1 = 175,
			hamstringTendonMidX1 = 690,
			hamstringTendonMidY1 = 172,
			hamstringTendonRightX1 = Math.round(tibiaKneeStartX1 + Math.cos(startTibiaAngle - Math.PI / 2) * (boneStrokeWidth / 2)) + 3,
			hamstringTendonRightY1 = Math.round(tibiaKneeStartY1 - Math.sin(startTibiaAngle - Math.PI / 2) * (boneStrokeWidth / 2)) + 1,
			
			hamstringTendonLeftX2 = 693,
			hamstringTendonLeftY2 = 175,
			hamstringTendonMidX2 = 705,
			hamstringTendonMidY2 = 162,
			hamstringTendonRightX2 = Math.round(tibiaKneeStartX1 + Math.cos(startTibiaAngle + reflexAngle - Math.PI / 2) * 15) + 3,
			hamstringTendonRightY2 = Math.round(tibiaKneeStartY1 - Math.sin(startTibiaAngle + reflexAngle - Math.PI / 2) * 15) + 3,
			
			hammerX1 = Math.round(720 - scaleFactor * 350),
			hammerX2 = Math.round(717 - scaleFactor * 350),
			hammerX3 = Math.round(757 - scaleFactor * 350),
			hammerX4 = Math.round(772 - scaleFactor * 350),
			hammerY1 = Math.round(143 + scaleFactor * 350),
			hammerY2 = Math.round(138 + scaleFactor * 350),
			hammerY3 = Math.round(98 + scaleFactor * 350),
			hammerY4 = Math.round(118 + scaleFactor * 350);

		patellarTendonPath1 = 'M ' + patellarTendonLeftX1 + ' ' + patellarTendonLeftY1 + ' S ' + patellarTendonMidX1 + ' ' +
							  patellarTendonMidY1 + ' ' + patellarTendonRightX1 + ' ' + patellarTendonRightY1,
		patellarTendonPath2 = 'M ' + patellarTendonLeftX2 + ' ' + patellarTendonLeftY2 + ' S ' + patellarTendonMidX2 + ' ' +
							  patellarTendonMidY2 + ' ' + patellarTendonRightX2 + ' ' + patellarTendonRightY2,
		patellarTendonPath3 = 'M ' + patellarTendonLeftX3 + ' ' + patellarTendonLeftY3 + ' S ' + patellarTendonMidX3 + ' ' +
							  patellarTendonMidY3 + ' ' + patellarTendonRightX3 + ' ' + patellarTendonRightY3,
		hamstringTendonPath1 = 'M ' + hamstringTendonLeftX1 + ' ' + hamstringTendonLeftY1 + ' S ' + hamstringTendonMidX1 + ' ' +
							  hamstringTendonMidY1 + ' ' + hamstringTendonRightX1 + ' ' + hamstringTendonRightY1,
		hamstringTendonPath2 = 'M ' + hamstringTendonLeftX2 + ' ' + hamstringTendonLeftY2 + ' S ' + hamstringTendonMidX2 + ' ' +
							  hamstringTendonMidY2 + ' ' + hamstringTendonRightX2 + ' ' + hamstringTendonRightY2,

		startHammer = 'M 733 125 L 730 120 L 770 80 L 785 100 Z';
		endHammer = 'M ' + hammerX1 + ' ' + hammerY1 + ' L ' + hammerX2 + ' ' + hammerY2 + 
					' L ' + hammerX3 + ' ' + hammerY3 + ' L ' + hammerX4 + ' ' + hammerY4 + ' Z';			
		
		if (forceIntegral == 0) {
			reflex = false;
		} else {
			reflex = true;
		};
		
		resetAnimation();
	}

	
	function reset(params, layout) {
		controlsPanel.innerHTML = '';
		controls = simcontrols.controls(controlsPanel, params, layout);
		runSimulation();
	}


	function resetToDefaultSim() {
		reset(params, layout);
	}


	function clearDataTables() {
		lengthDataTable.innerHTML = '';
		lengthDataTable.style.display = 'none';

		forceDataTable.innerHTML = '';
		forceDataTable.style.display = 'none';

		spindleVDataTable.innerHTML = '';
		spindleVDataTable.style.display = 'none';

		alphaMNVDataTable.innerHTML = '';
		alphaMNVDataTable.style.display = 'none';
	}
	
	// Functions for animation along a path
	Raphael.fn.addGuides = function() {
		this.ca.guide = function(g) {
		  return {
			guide: g
		  };
		};
		this.ca.along = function(percent) {
		  var g = this.attr("guide");
		  var len = g.getTotalLength();
		  var point = g.getPointAtLength(percent * len);
		  var t = {
			transform: "t" + point.x + " " + point.y
		  };
		  return t;
		};
		this.ca.alongRight = function(percent) {
		  var g = this.attr("guide");
		  var len = g.getTotalLength();
		  var point = 1 - g.getPointAtLength(percent * len);
		  var t = {
			transfor: "t" + point.x + " " + point.y
		  };
		  return t;
		}
	 };
	paper.addGuides();
	
	// Animation functions
	var leftTrack = function (tracker, track, duration, delay) {			
			tracker.attr({guide: track, along: 0}).animate(Raphael.animation({along: 1}, duration * timeScale).delay(delay * timeScale));		
		},
		rightTrack = function (tracker, track, duration, delay) {			
			tracker.attr({guide: track, along: 1}).animate(Raphael.animation({along: 0}, duration * timeScale).delay(delay * timeScale));		
		},	
		contractMuscle = function (muscle, endLength, endWidth, duration, delay) {
			muscle.animate(Raphael.animation({rx: endLength, ry: endWidth}, duration * timeScale).delay(delay * timeScale));
		},
		moveMuscle = function (muscle, x, y, angle, duration, delay) {
			muscle.animate(Raphael.animation({transform: 'T' + x + ' ' + y + 'r' + angle}, duration * timeScale).delay(delay * timeScale));
		},
		changeObjectColor = function (object, fillColor, strokeColor, duration, delay) {
			object.animate(Raphael.animation({fill: fillColor, stroke: strokeColor}, duration * timeScale).delay(delay * timeScale));
		},	
		changePathColor = function (path, color, duration, delay) {
			path.animate(Raphael.animation({stroke: color}, duration * timeScale).delay(delay * timeScale));
		},
		movePath = function (path, pathString, duration, delay) {
			path.animate(Raphael.animation({path: pathString}, duration * timeScale).delay(delay * timeScale));
		},
		rotatePath = function (path, angle, xRotationPoint, yRotationPoint, duration, delay) {
			path.animate(Raphael.animation({transform: 'r' + angle + ' ' + xRotationPoint + ' ' + yRotationPoint}, duration * timeScale).delay(delay * timeScale));
		},
		changeOpacity = function (tracker, opacity, duration, delay) {
			tracker.animate(Raphael.animation({'opacity': opacity}, duration * timeScale).delay(delay * timeScale));
		};
	
	function resetAnimation() {
		quadriceps.attr({fill: '#FF4444', rx: 150, ry: 20});
		hamstring.attr({fill: '#FF4444', rx: 140, ry: 20});
		rotatePath(tibia, 0, tibiaKneeStartX1, tibiaKneeStartY1, 1, 0);
		rotatePath(foot, 0, tibiaKneeStartX1, tibiaKneeStartY1, 1, 0);
		patellarTendon1.attr({path: patellarTendonPath1, opacity: 1});
		patellarTendon2.attr({path: patellarTendonPath2, opacity: 0})
		hamstringTendon.attr({path: hamstringTendonPath1});
		motorNerveTracker.attr({fill: 'black', rx: 4, ry: 4, opacity: 1});
		inhibitoryNerveTracker.attr({fill: 'black', rx: 4, ry: 4, opacity: 1});
		hammer1.attr({path: startHammer, opacity: 1});
		hammer2.attr({path: endHammer, opacity: 0});
		changeOpacity(motorNerveTracker, 0, 1, 0);
		changeOpacity(inhibitoryNerveTracker, 0, 1, 0);
		motorToInterNeuronSynapse.attr({fill: nerveColorMid, stroke: nerveColorMid});
		motorNerve.attr({stroke: nerveColorMid});
		motorNerveToQuadricepsSynapse.attr({stroke: nerveColorMid});
		inhibitoryToInterNeuronSynapse.attr({fill: nerveColorMid, stroke: nerveColorMid});
		inhibitoryNerve.attr({stroke: nerveColorMid});
		inhibitoryNerveToHamstringSynapse.attr({stroke: nerveColorMid});
		
	}
		
	function reflexAnimation() {
		resetAnimation();
		
		setTimeout(function() {
			resetAnimation();
			
			var totalAnimTime;
			if (!reflex) {
				totalAnimTime = 200 * timeScale;
			} else { 
				totalAnimTime = 1100 * timeScale;
			}
			document.getElementById('ReflexRunButton').disabled = true;
			setTimeout(function(){document.getElementById('ReflexRunButton').disabled = false}, totalAnimTime);
			document.getElementById('ReflexAnimationButton').disabled = true;
			setTimeout(function(){document.getElementById('ReflexAnimationButton').disabled = false}, totalAnimTime);
			document.getElementById('ResetAnimationButton').disabled = true;
			setTimeout(function(){document.getElementById('ResetAnimationButton').disabled = false}, totalAnimTime);
				
					   
		
			movePath(hammer1, endHammer, 100, 0);
			movePath(patellarTendon1, patellarTendonPath2, 10, 90);
			
			changeOpacity(patellarTendon2, 1, 1, 120);
			changeOpacity(patellarTendon1, 0, 1, 150);
			changeOpacity(hammer2, 1, 1, 120);
			changeOpacity(hammer1, 0, 1, 150);
			movePath(hammer2, startHammer, 100, 200);
			
			
			
		/*quadricepsToAfferentSynapse = paper.ellipse(240, 70, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		afferentNerve = paper.path('M 240 70 R 280 118 360 135 545 115 L 550 118 555 112 560 118 565 112').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToInterNeuron = paper.path('M 150 60 R 190 30 240 70').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToInterNeuronSynapse = paper.path('M 140 55 L 152 58 L 153 70').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		afferentToMotorNeuron = paper.path('M 160 105 R 163 60 190 30 240 70').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		afferentToMotorNeuronSynapse = paper.path('M 150 110 L 160 105 L 168 110').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		
		interToAfferentNeuronSynapse = paper.ellipse(140, 70, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		interNeuron = paper.path('M 140 70 L 140 130').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		interToMotorNerveSynapse = paper.ellipse(140, 130, 3, 3).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		motorToInterNeuronSynapse = paper.ellipse(160, 120, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		motorNerve = paper.path('M 160 120 R 178 188 250 193 272 135 320 140 380 142 440 137 555 133').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		motorNerveToQuadricepsSynapse = paper.path('M 565 125 L 555 133 L 565 140').attr({stroke: nerveColorMid, 'stroke-width': 3}),
		inhibitoryToInterNeuronSynapse = paper.ellipse(140, 145, 6, 6).attr({fill: nerveColorMid, stroke: nerveColorMid}),
		inhibitoryNerve = paper.path('M 140 145 R 155 183 200 205 256 203 285 143 380 172 545 175').attr({stroke: nerveColorMid, 'stroke-width': 4}),
		inhibitoryNerveToHamstringSynapse = paper.path('M 555 167 L 545 175 L 555 183').attr({stroke: nerveColorMid, 'stroke-width': 3}),*/
			
			if (reflex) {
				changeOpacity(afferentNerveTracker, 1, 1, 100);
				changeObjectColor(quadricepsToAfferentSynapse, nerveColorDark, nerveColorDark, 1, 100);
				changePathColor(afferentNerve, nerveColorDark, 1, 100);
				changePathColor(afferentToInterNeuron, nerveColorDark, 1, 100);
				changePathColor(afferentToInterNeuronSynapse, nerveColorDark, 1, 100);
				changePathColor(afferentToMotorNeuron, nerveColorDark, 1, 100);
				changePathColor(afferentToMotorNeuronSynapse, nerveColorDark, 1, 100);
				rightTrack(afferentNerveTracker, afferentNerve, 200, 100);
				changeOpacity(afferentNerveTracker, 0, 1, 300);
				
				changeOpacity(afferentToInterNeuronTracker, 1, 1, 295);
				rightTrack(afferentToInterNeuronTracker, afferentToInterNeuron, 130, 300);
				changeOpacity(afferentToInterNeuronTracker, 0, 1, 440);
				
				changeOpacity(afferentToMotorNeuronTracker, 1, 1, 295);
				rightTrack(afferentToMotorNeuronTracker, afferentToMotorNeuron, 130, 300);
				changeOpacity(afferentToMotorNeuronTracker, 0, 1, 440);
				
				changeObjectColor(quadricepsToAfferentSynapse, nerveColorMid, nerveColorMid, 1, 440);
				changePathColor(afferentNerve, nerveColorMid, 1, 440);
				changePathColor(afferentToInterNeuron, nerveColorMid, 1, 440);
				changePathColor(afferentToInterNeuronSynapse, nerveColorMid, 1, 440);
				changePathColor(afferentToMotorNeuron, nerveColorMid, 1, 440);
				changePathColor(afferentToMotorNeuronSynapse, nerveColorMid, 1, 440);
				
				changeOpacity(interNeuronTracker, 1, 1, 440);
				changeObjectColor(interToAfferentNeuronSynapse, nerveColorDark, nerveColorDark, 1, 440);
				changePathColor(interNeuron, nerveColorDark, 1, 440);
				changeObjectColor(interToMotorNerveSynapse, nerveColorDark, nerveColorDark, 1, 440);
				leftTrack(interNeuronTracker, interNeuron, 50, 450);
				changeOpacity(interNeuronTracker, 0, 1, 500);
				changeObjectColor(interToAfferentNeuronSynapse, nerveColorMid, nerveColorMid, 1, 500);
				changePathColor(interNeuron, nerveColorMid, 1, 500);
				changeObjectColor(interToMotorNerveSynapse, nerveColorMid, nerveColorMid, 1, 500);
				
				changeOpacity(motorNerveTracker, 1, 1, 440);
				changeObjectColor(motorToInterNeuronSynapse, nerveColorDark, nerveColorDark, 1, 440);
				changePathColor(motorNerve, nerveColorDark, 1, 440);
				changePathColor(motorNerveToQuadricepsSynapse, nerveColorDark, 1, 440);
				leftTrack(motorNerveTracker, motorNerve, 300, 450);
				changeObjectColor(motorNerveTracker, 'red', 'black', 50, 800),
				contractMuscle(motorNerveTracker, 150, 20, 50, 800);
				changeOpacity(motorNerveTracker, 0, 50, 800);
				changeObjectColor(inhibitoryToInterNeuronSynapse, nerveColorLight, nerveColorLight, 1, 500);
				changePathColor(inhibitoryNerve, nerveColorLight, 1, 500);
				changePathColor(inhibitoryNerveToHamstringSynapse, nerveColorLight, 1, 500);
				
				/*changeOpacity(inhibitoryNerveTracker, 1, 1, 500);
				leftTrack(inhibitoryNerveTracker, inhibitoryNerve, 250, 500);
				changeObjectColor(inhibitoryNerveTracker, 'white', 50, 800),
				contractMuscle(inhibitoryNerveTracker, 150, 20, 50, 800);
				changeOpacity(inhibitoryNerveTracker, 0, 50, 800);*/
				
				contractMuscle(quadriceps, quadricepsEndWidth, 25, 150, 900);
				changeObjectColor(quadriceps, '#E60000', 'black', 20, 900);
				contractMuscle(hamstring, 150, 15, 150, 900);
				changeObjectColor(hamstring, '#FF9999', 'black', 20, 900);
				
				movePath(patellarTendon2, patellarTendonPath3, 150, 900);
				movePath(hamstringTendon, hamstringTendonPath2, 150, 900);
				rotatePath(tibia, -reflexAngleDeg, tibiaKneeStartX1, tibiaKneeStartY1, 150, 900);
				rotatePath(foot, -reflexAngleDeg, tibiaKneeStartX1, tibiaKneeStartY1, 150, 900);
			}
			}, 100);

	}
	

	(document.getElementById('ReflexRunButton')
		.addEventListener('click', runSimulation, false));
	(document.getElementById('ReflexResetButton')
		.addEventListener('click', resetToDefaultSim, false));
	(document.getElementById('ReflexClearDataButton')
		.addEventListener('click', clearDataTables, false));
	(document.getElementById('ReflexAnimationButton')
		.addEventListener('click', reflexAnimation, false));
	(document.getElementById('ResetAnimationButton')
		.addEventListener('click', resetAnimation, false));
	

	// make the enter key run the simulation  
	controlsPanel.addEventListener('keydown',  
		function (evt, element) {
			if (evt.keyCode === 13) { // enter was pressed 
				controls.triggerRead();
				runSimulation();
				return false;
			}
		}, true);

	resetToDefaultSim();
	clearDataTables();

}, false);

