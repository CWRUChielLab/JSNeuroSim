/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 1000e-3, 
        currentRunNumber = 0; 

    // set up the controls for the passive membrane simulation
    params = { 

        diameter_node_um: { label: 'Axon diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_node_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_node_uF_p_cm2: { label: 'Membrane capacitance', 
            units: '\u00B5F/cm\u00B2',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_node_mS_p_cm2: { label: 'Leak conductance', 
            units: 'mS/cm\u00B2', 
            defaultVal: 0.3, minVal: 0.01, maxVal: 1000 }, 
        E_leak_node_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_node_mS_p_cm2: { label: 'Fast transient sodium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 120, minVal: 0.0, maxVal: 1000 }, 
        E_Na_node_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_node_mS_p_cm2: { label: 'Delayed rectifier potassium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 36, minVal: 0.0, maxVal: 1000 }, 
        E_K_node_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        len_node_um: { label: 'node length', 
            units: '\u00B5m', defaultVal: 100, minVal: 0.1, maxVal: 100 },

        diameter_myelin_um: { label: 'Axon diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_myelin_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_myelin_uF_p_cm2: { label: 'Membrane capacitance', 
            units: '\u00B5F/cm\u00B2',
            defaultVal: 0.001, minVal: 0.0001, maxVal: 100 }, 
        g_leak_myelin_mS_p_cm2: { label: 'Leak conductance', 
            units: 'mS/cm\u00B2', 
            defaultVal: 0.01, minVal: 0.001, maxVal: 1000 }, 
        E_leak_myelin_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_myelin_mS_p_cm2: { label: 'Fast transient sodium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 0, minVal: 0, maxVal: 1000 }, 
        E_Na_myelin_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_myelin_mS_p_cm2: { label: 'Delayed rectifier potassium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 0, minVal: 0, maxVal: 1000 }, 
        E_K_myelin_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        len_myelin_um: { label: 'internodal distance', 
            units: '\u00B5m', defaultVal: 6000, minVal: 100, maxVal: 100000 },

        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0.3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 0.4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 6, minVal: 0, maxVal: tMax / 1e-3 },
        numCompartments: { label: 'Number of compartments', units: '', 
            defaultVal: 5, minVal: 2, maxVal: 100 },
    };
    layout = [
        ['Node of Ranvier Properties', ['diameter_node_um', 
            'R_axial_node_ohm_cm', 
            'C_node_uF_p_cm2', 'g_leak_node_mS_p_cm2', 'E_leak_node_mV', 
            'g_Na_node_mS_p_cm2', 'E_Na_node_mV', 
            'g_K_node_mS_p_cm2', 'E_K_node_mV', 'len_node_um']],
        ['Myelinated Segment Properties', ['diameter_myelin_um', 
            'R_axial_myelin_ohm_cm', 
            'C_myelin_uF_p_cm2', 'g_leak_myelin_mS_p_cm2', 'E_leak_myelin_mV', 
            'g_Na_myelin_mS_p_cm2', 'E_Na_myelin_mV', 
            'g_K_myelin_mS_p_cm2', 'E_K_myelin_mV', 
            'len_myelin_um']],
        ['Current Clamp, Node 1', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms', 'numCompartments']]
    ];
    controlsPanel = document.getElementById('MyelinatedCableControls');

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, leftNodeCompartment, rightNodeCompartment, 
            myelinatedCompartment, pulseTrain,
            result, t, v_0, v_c, v_f, t_ms, v_0_mV, v_c_mV, v_f_mV, 
            params, iStim_nA,
            plotPanel, title, i, 
            l_compartment_myelin_um, surfaceArea_myelin_cm2, 
            crossSectionalArea_myelin_cm2, 
            r_intercompartment_myelin, 
            l_compartment_node_um, surfaceArea_node_cm2, 
            crossSectionalArea_node_cm2, 
            r_intercompartment_node, 
            r_intercompartment_boundary, 
            V_rest = -73.25e-3,
            startTime = new Date().getTime(),
            numNodeCompartments = 1, numMyelinatedCompartments,
            t0, y0, runNumber;
       
        params = controls.values;


        numMyelinatedCompartments = params.numCompartments;

        l_compartment_myelin_um = params.len_myelin_um / params.numCompartments;
        surfaceArea_myelin_cm2 = Math.PI * params.diameter_myelin_um * 
            l_compartment_myelin_um * 1e-8;
        crossSectionalArea_myelin_cm2 = Math.PI * params.diameter_myelin_um * 
            params.diameter_myelin_um * 1e-8 / 4;
        r_intercompartment_myelin = params.R_axial_myelin_ohm_cm * 
            l_compartment_myelin_um / crossSectionalArea_myelin_cm2 * 1e-4;

        l_compartment_node_um = params.len_node_um / numNodeCompartments;
        surfaceArea_node_cm2 = Math.PI * params.diameter_node_um * 
            l_compartment_node_um * 1e-8;
        crossSectionalArea_node_cm2 = Math.PI * params.diameter_node_um * 
            params.diameter_node_um * 1e-8 / 4;
        r_intercompartment_node = params.R_axial_node_ohm_cm * 
            l_compartment_node_um / crossSectionalArea_node_cm2 * 1e-4;

        r_intercompartment_boundary = (r_intercompartment_node + 
            r_intercompartment_myelin) / 2;

        model = componentModel.componentModel();

        // create the myelinated segment
        myelinatedCompartment = [];        
        for (i = 0; i < numMyelinatedCompartments; i += 1) {
            myelinatedCompartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_myelin_uF_p_cm2 * surfaceArea_myelin_cm2 * 1e-6, 
                g_leak: (params.g_leak_myelin_mS_p_cm2 * 
                    surfaceArea_myelin_cm2 * 1e-3), 
                E_leak: params.E_leak_myelin_mV * 1e-3,
                V_rest: V_rest
            });

            if (i > 0) {
                electrophys.gapJunction(myelinatedCompartment[i - 1], 
                    myelinatedCompartment[i], { 
                        g: 1 / r_intercompartment_myelin 
                    });
            }

            electrophys.hhKConductance(model, 
                myelinatedCompartment[i], {
                    g_K: params.g_K_myelin_mS_p_cm2 * surfaceArea_myelin_cm2 * 1e-3,
                    E_K: params.E_K_myelin_mV * 1e-3,
                    V_rest: V_rest
                });
            
            electrophys.hhNaConductance(model, 
                myelinatedCompartment[i], {
                    g_Na: params.g_Na_myelin_mS_p_cm2 * surfaceArea_myelin_cm2 * 1e-3,
                    E_Na: params.E_Na_myelin_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        // create the left nodes
        leftNodeCompartment = [];        
        for (i = 0; i < numNodeCompartments; i += 1) {
            leftNodeCompartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_node_uF_p_cm2 * surfaceArea_node_cm2 * 1e-6, 
                g_leak: (params.g_leak_node_mS_p_cm2 * 
                    surfaceArea_node_cm2 * 1e-3), 
                E_leak: params.E_leak_node_mV * 1e-3,
                V_rest: V_rest
            });

            if (i === 0) { 
                electrophys.gapJunction(myelinatedCompartment[0], 
                    leftNodeCompartment[i], { 
                        g: 1 / r_intercompartment_boundary
                    });
            } else {
                electrophys.gapJunction(leftNodeCompartment[i - 1], 
                    leftNodeCompartment[i], { 
                        g: 1 / r_intercompartment_node 
                    });
            }

            electrophys.hhKConductance(model, 
                leftNodeCompartment[i], {
                    g_K: params.g_K_node_mS_p_cm2 * surfaceArea_node_cm2 * 1e-3,
                    E_K: params.E_K_node_mV * 1e-3,
                    V_rest: V_rest
                });
            
            electrophys.hhNaConductance(model, 
                leftNodeCompartment[i], {
                    g_Na: params.g_Na_node_mS_p_cm2 * surfaceArea_node_cm2 * 1e-3,
                    E_Na: params.E_Na_node_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        // create the right nodes
        rightNodeCompartment = [];        
        for (i = 0; i < numNodeCompartments; i += 1) {
            rightNodeCompartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_node_uF_p_cm2 * surfaceArea_node_cm2 * 1e-6, 
                g_leak: (params.g_leak_node_mS_p_cm2 * 
                    surfaceArea_node_cm2 * 1e-3), 
                E_leak: params.E_leak_node_mV * 1e-3,
                V_rest: V_rest
            });

            if (i === 0) { 
                electrophys.gapJunction(
                    myelinatedCompartment[numMyelinatedCompartments - 1], 
                    rightNodeCompartment[i], 
                    { 
                        g: 1 / r_intercompartment_boundary
                    }
                );
            } else {
                electrophys.gapJunction(rightNodeCompartment[i - 1], 
                    rightNodeCompartment[i], { 
                        g: 1 / r_intercompartment_node 
                    });
            }

            electrophys.hhKConductance(model, 
                rightNodeCompartment[i], 
                {
                    g_K: params.g_K_node_mS_p_cm2 * surfaceArea_node_cm2 * 1e-3,
                    E_K: params.E_K_node_mV * 1e-3,
                    V_rest: V_rest
                });
            
            electrophys.hhNaConductance(model, 
                rightNodeCompartment[i], 
                {
                    g_Na: params.g_Na_node_mS_p_cm2 * surfaceArea_node_cm2 * 1e-3,
                    E_Na: params.E_Na_node_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        leftNodeCompartment[0].addCurrent(pulseTrain);
        
        t_ms = [];
        v_0_mV = [];
        v_c_mV = [];
        v_f_mV = [];
        iStim_nA = [];

        t0 = 0;
        y0 = model.initialValues();
        runNumber = currentRunNumber += 1;

        function updateSim() {
            if (runNumber !== currentRunNumber) {
                return;
            }

            // simulate it
            result = model.integrate({
                tMin: t0, 
                tMax: params.totalDuration_ms * 1e-3, 
                tMaxStep: 1e-6,
                tMinOutput: 2e-5,
                y0: y0, 
                timeout: 100
            });
            
            t = result.t;
            v_0 = leftNodeCompartment[0].V(result.y, result.t);
            v_c = myelinatedCompartment[
                Math.floor(numMyelinatedCompartments / 2)
            ].V(result.y, result.t);
            v_f = rightNodeCompartment[0].V(result.y, result.t);

            t_ms = t_ms.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(t));
            v_0_mV = v_0_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_0));
            v_c_mV = v_c_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_c));
            v_f_mV = v_f_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_f));
          
            iStim_nA = iStim_nA.concat(t.map(function (t) {return pulseTrain([], t) / 1e-9; }));

            // plot the results
            plotPanel = document.getElementById('MyelinatedCablePlots');
            plotPanel.innerHTML = '';
            
            title = document.createElement('h4');
            title.innerHTML = 'Membrane potential node 1 (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_0_mV,
                { xUnits: 'ms', yUnits: 'mV', 
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 
                'Membrane potential in mylenated segment (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_c_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Membrane potential node 2 (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_f_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            if (result.terminationReason === 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            } else {
                console.log('Total time: ' + (new Date().getTime() - startTime));
            }
        }

        window.setTimeout(updateSim, 0);
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('MyelinatedCableRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MyelinatedCableResetButton')
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

