/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 600000e-3, 
        currentRunNumber = 0; 

    // set up the controls for the passive membrane simulation
    params = { 
        pulseStart_ms_C2: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_C2: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_C2: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_C2: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_C2: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_DSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_DSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_VSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_VSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_VSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_VSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_VSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 7000, minVal: 0, maxVal: tMax / 1e-3 },
    };
    layout = [
        ['C2 Current Clamp', ['pulseStart_ms_C2', 'pulseHeight_nA_C2', 
            'pulseWidth_ms_C2', 'isi_ms_C2', 'numPulses_C2']],
        ['DSI Current Clamp', ['pulseStart_ms_DSI', 'pulseHeight_nA_DSI', 
            'pulseWidth_ms_DSI', 'isi_ms_DSI', 'numPulses_DSI']],
        ['VSI Current Clamp', ['pulseStart_ms_VSI', 'pulseHeight_nA_VSI', 
            'pulseWidth_ms_VSI', 'isi_ms_VSI', 'numPulses_VSI']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('TritoniaControls');

    // simulate and plot the tritonia swim CPG from Calin-Jageman et al 2007
    function runSimulation() {
        var params, plotPanel, title,
            model, result,
            C2, C2Shunt, C2Fast, C2Med, C2Slow, pulseTrainC2,
            v_C2, v_C2_mV, iStim_C2_nA,
            DSI, DSIShunt, DSIFast, DSISlow, pulseTrainDSI,
            v_DSI, v_DSI_mV, iStim_DSI_nA,
            VSI, VSIShunt, VSIFast, VSISlow, VSIToVSI_E1, pulseTrainVSI,
            v_VSI, v_VSI_mV, iStim_VSI_nA,
            t, t_ms, 
            startTime = new Date().getTime(),
            t0, y0, runNumber;
       
        params = controls.values;
        model = componentModel.componentModel();

        // create the C2 neuron
        C2 = electrophys.gettingIFNeuron(model, 
            { C: 2.27e-9, g_leak: 1 / 23.3e6, E_leak: -48e-3, 
                theta_ss: -34e-3, theta_r: 0e-3, theta_tau: 65.0e-3 });
        C2Fast = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.12000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:   30e-3 });
        C2Med = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.02800e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close: 1200e-3 });
        C2Slow = electrophys.gettingSynapse(model, C2, C2, 
            { W: 0.00300e-6, E_rev: -80e-3, tau_open: 4000e-3, 
                tau_close: 4000e-3 });
        pulseTrainC2 = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_C2, 
            width: params.pulseWidth_ms_C2 * 1e-3, 
            height: params.pulseHeight_nA_C2 * 1e-9,
            gap: params.isi_ms_C2 * 1e-3,
            num_pulses: params.numPulses_C2
        });
        C2.addCurrent(pulseTrainC2);
        

        // create the DSI neuron
        DSI = electrophys.gettingIFNeuron(model, 
            { C: 1.5714765e-9, g_leak: 1 / 38.8e6, E_leak: -47.5e-3, 
                theta_ss: -50e-3, theta_r: 200e-3, theta_tau: 15.0e-3 });
        DSIShunt = electrophys.gettingShuntConductance(model, DSI,
            { G: 0.08e-6, E_rev: -47.5e-3, B_m: 29e-3, C_m: -1e-3, 
                tau_m: 10e-3, B_h: -100e-3, C_h: 1e-3, tau_h: 100000e-3 });
        DSIFast = electrophys.gettingSynapse(model, DSI, DSI, 
            { W: 0.30000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:   85e-3 });
        DSISlow = electrophys.gettingSynapse(model, DSI, DSI, 
            { W: 0.01200e-6, E_rev: -80e-3, tau_open:  200e-3, 
                tau_close: 2800e-3 });
        pulseTrainDSI = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_DSI, 
            width: params.pulseWidth_ms_DSI * 1e-3, 
            height: params.pulseHeight_nA_DSI * 1e-9,
            gap: params.isi_ms_DSI * 1e-3,
            num_pulses: params.numPulses_DSI
        });
        DSI.addCurrent(pulseTrainDSI);
        

        // create the VSI neuron
        VSI = electrophys.gettingIFNeuron(model, 
            { C: 3.2e-9, g_leak: 1 / 14e6, E_leak: -56e-3, 
                theta_ss: -38e-3, theta_r: 10e-3, theta_tau: 10.0e-3 });
        VSIShunt = electrophys.gettingShuntConductance(model, VSI,
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                    B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3 });
        VSIFast = electrophys.gettingSynapse(model, VSI, VSI, 
            { W: 0.54000e-6, E_rev: -80e-3, tau_open:   10e-3, 
                tau_close:  100e-3 });
        VSISlow = electrophys.gettingSynapse(model, VSI, VSI, 
            { W: 0.00460e-6, E_rev: -80e-3, tau_open: 1000e-3, 
                tau_close: 2500e-3 });
        VSIToVSI_E1 = electrophys.gettingSynapse(model, VSI, VSI, 
            { W: 0.02800e-6, E_rev: -10e-3, tau_open: 200e-3, 
                tau_close: 500e-3 });
        pulseTrainVSI = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_VSI, 
            width: params.pulseWidth_ms_VSI * 1e-3, 
            height: params.pulseHeight_nA_VSI * 1e-9,
            gap: params.isi_ms_VSI * 1e-3,
            num_pulses: params.numPulses_VSI
        });
        VSI.addCurrent(pulseTrainVSI);
        


        // simulate them
        
        result = model.integrate({tMin: -0.6, tMax: 7, tMaxStep: 2e-3});
        t = result.t;
        
        
        t_ms = [];
        v_C2_mV = [];
        iStim_C2_nA = [];
        v_DSI_mV = [];
        iStim_DSI_nA = [];
        v_VSI_mV = [];
        iStim_VSI_nA = [];

        t0 = 0;
        y0 = model.initialValues();
        runNumber = currentRunNumber += 1;

        function updateSim() {
            if (runNumber != currentRunNumber) {
                return;
            }

            result = model.integrate({
                tMin: t0, 
                tMax: params.totalDuration_ms * 1e-3, 
                tMaxStep: Math.min(16e-3, params.totalDuration_ms * 1e-3/500),
                y0: y0, 
                timeout: 500
            });
            
            t = result.t;
            v_C2 = C2.VWithSpikes(result.y, result.t);
            v_DSI = DSI.VWithSpikes(result.y, result.t);
            v_VSI = VSI.VWithSpikes(result.y, result.t);

            t_ms = t_ms.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(t));
            v_C2_mV = v_C2_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_C2));
            iStim_C2_nA = iStim_C2_nA.concat(t.map(function (t) {
                return pulseTrainC2([], t) / 1e-9; }));

            v_DSI_mV = v_DSI_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_DSI));
            iStim_DSI_nA = iStim_DSI_nA.concat(t.map(function (t) {
                return pulseTrainDSI([], t) / 1e-9; }));

            v_VSI_mV = v_VSI_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_VSI));
            iStim_VSI_nA = iStim_VSI_nA.concat(t.map(function (t) {
                return pulseTrainVSI([], t) / 1e-9; }));

            // plot the results
            plotPanel = document.getElementById('TritoniaPlots');
            plotPanel.innerHTML = '';
            
            title = document.createElement('h4');
            title.innerHTML = 'C2 potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_C2_mV,
                {xUnits: 'ms', yUnits: 'mV', 
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'C2 Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_C2_nA,
                {xUnits: 'ms', yUnits: 'nA',
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'DSI potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_DSI_mV,
                {xUnits: 'ms', yUnits: 'mV', 
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'DSI Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_DSI_nA,
                {xUnits: 'ms', yUnits: 'nA',
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'VSI potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_VSI_mV,
                {xUnits: 'ms', yUnits: 'mV', 
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'VSI Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_VSI_nA,
                {xUnits: 'ms', yUnits: 'nA',
                xMin: -0.02 * params.totalDuration_ms, 
                xMax: params.totalDuration_ms});

            if (result.terminationReason == 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            }
            else {
                console.log('Total time: ' + 
                        (new Date().getTime() - startTime));
            }
        }

        window.setTimeout(updateSim, 0);
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('TritoniaRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('TritoniaResetButton')
        .addEventListener('click', reset, false));
    

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

