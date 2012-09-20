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

        diameter_trunk_um: { label: 'Diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_trunk_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_trunk_uF_p_cm2: { label: 'Membrane capacitance',
            units: '\u00B5F/cm\u00B2',
            defaultVal: 1, minVal: 0.01, maxVal: 100 },
        g_leak_trunk_mS_p_cm2: { label: 'Leak conductance',
            units: 'mS/cm\u00B2',
            defaultVal: 0.3, minVal: 0.01, maxVal: 1000 },
        E_leak_trunk_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 },
        g_Na_trunk_mS_p_cm2: { label: 'Fast transient sodium conductance',
            units: 'mS/cm\u00B2', defaultVal: 120, minVal: 0.0, maxVal: 1000 },
        E_Na_trunk_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 },
        g_K_trunk_mS_p_cm2: { label: 'Delayed rectifier potassium conductance',
            units: 'mS/cm\u00B2', defaultVal: 36, minVal: 0.0, maxVal: 1000 },
        E_K_trunk_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 },
        len_trunk_um: { label: 'trunk length',
            units: '\u00B5m', defaultVal: 3000, minVal: 0.1, maxVal: 10000 },

        diameter_branch1_um: { label: 'Diameter', units: '\u00B5m',
            defaultVal: 1, minVal: 0.001, maxVal: 1000 },
        R_axial_branch1_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_branch1_uF_p_cm2: { label: 'Membrane capacitance',
            units: '\u00B5F/cm\u00B2',
            defaultVal: 1, minVal: 0.0001, maxVal: 100 },
        g_leak_branch1_mS_p_cm2: { label: 'Leak conductance',
            units: 'mS/cm\u00B2',
            defaultVal: 0.3, minVal: 0.001, maxVal: 1000 },
        E_leak_branch1_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 },
        g_Na_branch1_mS_p_cm2: { label: 'Fast transient sodium conductance',
            units: 'mS/cm\u00B2', defaultVal: 120, minVal: 0, maxVal: 1000 },
        E_Na_branch1_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 },
        g_K_branch1_mS_p_cm2: { label: 'Delayed rectifier potassium conductance',
            units: 'mS/cm\u00B2', defaultVal: 36, minVal: 0, maxVal: 1000 },
        E_K_branch1_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 },
        len_branch1_um: { label: 'branch 1 length',
            units: '\u00B5m', defaultVal: 3000, minVal: 100, maxVal: 10000 },

        diameter_branch2_um: { label: 'Diameter', units: '\u00B5m',
            defaultVal: 1, minVal: 0.001, maxVal: 1000 },
        R_axial_branch2_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_branch2_uF_p_cm2: { label: 'Membrane capacitance',
            units: '\u00B5F/cm\u00B2',
            defaultVal: 1, minVal: 0.0001, maxVal: 100 },
        g_leak_branch2_mS_p_cm2: { label: 'Leak conductance',
            units: 'mS/cm\u00B2',
            defaultVal: 0.3, minVal: 0.001, maxVal: 1000 },
        E_leak_branch2_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 },
        g_Na_branch2_mS_p_cm2: { label: 'Fast transient sodium conductance',
            units: 'mS/cm\u00B2', defaultVal: 120, minVal: 0, maxVal: 1000 },
        E_Na_branch2_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 },
        g_K_branch2_mS_p_cm2: { label: 'Delayed rectifier potassium conductance',
            units: 'mS/cm\u00B2', defaultVal: 36, minVal: 0, maxVal: 1000 },
        E_K_branch2_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 },
        len_branch2_um: { label: 'branch 2 length',
            units: '\u00B5m', defaultVal: 3000, minVal: 100, maxVal: 10000 },

        trunkPulseStart_ms: { label: 'Stimulus delay', units: 'ms',
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        trunkPulseHeight_nA: { label: 'Stimulus current', units: 'nA',
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        trunkPulseWidth_ms: { label: 'Pulse duration', units: 'ms',
            defaultVal: 0.4, minVal: 0, maxVal: tMax / 1e-3 },
        trunkIsi_ms: { label: 'Inter-stimulus interval', units: 'ms',
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        trunkNumPulses: { label: 'Number of pulses', units: '',
            defaultVal: 1, minVal: 0, maxVal: 100 },

        branch1PulseStart_ms: { label: 'Stimulus delay', units: 'ms',
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        branch1PulseHeight_nA: { label: 'Stimulus current', units: 'nA',
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        branch1PulseWidth_ms: { label: 'Pulse duration', units: 'ms',
            defaultVal: 0.4, minVal: 0, maxVal: tMax / 1e-3 },
        branch1Isi_ms: { label: 'Inter-stimulus interval', units: 'ms',
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        branch1NumPulses: { label: 'Number of pulses', units: '',
            defaultVal: 0, minVal: 0, maxVal: 100 },

        branch2PulseStart_ms: { label: 'Stimulus delay', units: 'ms',
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        branch2PulseHeight_nA: { label: 'Stimulus current', units: 'nA',
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        branch2PulseWidth_ms: { label: 'Pulse duration', units: 'ms',
            defaultVal: 0.4, minVal: 0, maxVal: tMax / 1e-3 },
        branch2Isi_ms: { label: 'Inter-stimulus interval', units: 'ms',
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        branch2NumPulses: { label: 'Number of pulses', units: '',
            defaultVal: 0, minVal: 0, maxVal: 100 },

        numCompartments: { label: 'Number of compartments', units: '',
            defaultVal: 4, minVal: 4, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms',
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Trunk Properties', ['diameter_trunk_um',
            'R_axial_trunk_ohm_cm',
            'C_trunk_uF_p_cm2', 'g_leak_trunk_mS_p_cm2', 'E_leak_trunk_mV',
            'g_Na_trunk_mS_p_cm2', 'E_Na_trunk_mV',
            'g_K_trunk_mS_p_cm2', 'E_K_trunk_mV', 'len_trunk_um']],
        ['Branch 1 Properties', ['diameter_branch1_um',
            'R_axial_branch1_ohm_cm',
            'C_branch1_uF_p_cm2', 'g_leak_branch1_mS_p_cm2', 'E_leak_branch1_mV',
            'g_Na_branch1_mS_p_cm2', 'E_Na_branch1_mV',
            'g_K_branch1_mS_p_cm2', 'E_K_branch1_mV', 'len_branch1_um']],
        ['Branch 2 Properties', ['diameter_branch2_um',
            'R_axial_branch2_ohm_cm',
            'C_branch2_uF_p_cm2', 'g_leak_branch2_mS_p_cm2', 'E_leak_branch2_mV',
            'g_Na_branch2_mS_p_cm2', 'E_Na_branch2_mV',
            'g_K_branch2_mS_p_cm2', 'E_K_branch2_mV', 'len_branch2_um']],
        ['Current Clamp, Trunk', ['trunkPulseStart_ms', 'trunkPulseHeight_nA',
            'trunkPulseWidth_ms', 'trunkIsi_ms', 'trunkNumPulses']],
        ['Current Clamp, Branch 1', ['branch1PulseStart_ms', 'branch1PulseHeight_nA',
            'branch1PulseWidth_ms', 'branch1Isi_ms', 'branch1NumPulses']],
        ['Current Clamp, Branch 2', ['branch2PulseStart_ms', 'branch2PulseHeight_nA',
            'branch2PulseWidth_ms', 'branch2Isi_ms', 'branch2NumPulses']],
        ['Simulation Settings', ['totalDuration_ms', 'numCompartments']]
    ];
    controlsPanel = document.getElementById('BranchedCableControls');

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, branch1Compartment, branch2Compartment,
            trunkCompartment, pulseTrainTrunk, pulseTrainBranch1, pulseTrainBranch2,
            result,
            t, v_trunk, v_junction, v_branch1, v_branch2,
            t_ms, v_trunk_mV, v_junction_mV, v_branch1_mV, v_branch2_mV,
            params,
            iStim_trunk_nA, iStim_branch1_nA, iStim_branch2_nA,
            plotPanel, title, i,
            l_compartment_trunk_um, surfaceArea_trunk_cm2,
            crossSectionalArea_trunk_cm2,
            r_intercompartment_trunk,
            r_trunk_branch1_boundary,
            r_trunk_branch2_boundary,
            l_compartment_branch1_um, surfaceArea_branch1_cm2,
            crossSectionalArea_branch1_cm2,
            r_intercompartment_branch1,
            l_compartment_branch2_um, surfaceArea_branch2_cm2,
            crossSectionalArea_branch2_cm2,
            r_intercompartment_branch2,
            V_rest = -64.14e-3,
            startTime = new Date().getTime(),
            numBranchCompartments, numTrunkCompartments,
            t0, y0, runNumber;

        params = controls.values;


        numTrunkCompartments = params.numCompartments;
        numBranchCompartments = params.numCompartments;

        l_compartment_trunk_um = params.len_trunk_um / numBranchCompartments;
        surfaceArea_trunk_cm2 = Math.PI * params.diameter_trunk_um *
            l_compartment_trunk_um * 1e-8;
        crossSectionalArea_trunk_cm2 = Math.PI * params.diameter_trunk_um *
            params.diameter_trunk_um * 1e-8 / 4;
        r_intercompartment_trunk = params.R_axial_trunk_ohm_cm *
            l_compartment_trunk_um / crossSectionalArea_trunk_cm2 * 1e-4;

        l_compartment_branch1_um = params.len_branch1_um / params.numCompartments;
        surfaceArea_branch1_cm2 = Math.PI * params.diameter_branch1_um *
            l_compartment_branch1_um * 1e-8;
        crossSectionalArea_branch1_cm2 = Math.PI * params.diameter_branch1_um *
            params.diameter_branch1_um * 1e-8 / 4;
        r_intercompartment_branch1 = params.R_axial_branch1_ohm_cm *
            l_compartment_branch1_um / crossSectionalArea_branch1_cm2 * 1e-4;
        r_trunk_branch1_boundary = (r_intercompartment_trunk +
            r_intercompartment_branch1) / 2;

        l_compartment_branch2_um = params.len_branch2_um / params.numCompartments;
        surfaceArea_branch2_cm2 = Math.PI * params.diameter_branch2_um *
            l_compartment_branch2_um * 1e-8;
        crossSectionalArea_branch2_cm2 = Math.PI * params.diameter_branch2_um *
            params.diameter_branch2_um * 1e-8 / 4;
        r_intercompartment_branch2 = params.R_axial_branch2_ohm_cm *
            l_compartment_branch2_um / crossSectionalArea_branch2_cm2 * 1e-4;
        r_trunk_branch2_boundary = (r_intercompartment_trunk +
            r_intercompartment_branch2) / 2;


        model = componentModel.componentModel();

        // create the trunk segment
        trunkCompartment = [];
        for (i = 0; i < numTrunkCompartments; i += 1) {
            trunkCompartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_trunk_uF_p_cm2 * surfaceArea_trunk_cm2 * 1e-6,
                g_leak: (params.g_leak_trunk_mS_p_cm2 *
                    surfaceArea_trunk_cm2 * 1e-3),
                E_leak: params.E_leak_trunk_mV * 1e-3,
                V_rest: V_rest
            });

            if (i > 0) {
                electrophys.gapJunction(trunkCompartment[i - 1],
                    trunkCompartment[i], {
                        g: 1 / r_intercompartment_trunk
                    });
            }

            electrophys.hhKConductance(model,
                trunkCompartment[i], {
                    g_K: params.g_K_trunk_mS_p_cm2 * surfaceArea_trunk_cm2 * 1e-3,
                    E_K: params.E_K_trunk_mV * 1e-3,
                    V_rest: V_rest
                });

            electrophys.hhNaConductance(model,
                trunkCompartment[i], {
                    g_Na: params.g_Na_trunk_mS_p_cm2 * surfaceArea_trunk_cm2 * 1e-3,
                    E_Na: params.E_Na_trunk_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        // create the first branch
        branch1Compartment = [];
        for (i = 0; i < numBranchCompartments; i += 1) {
            branch1Compartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_branch1_uF_p_cm2 * surfaceArea_branch1_cm2 * 1e-6,
                g_leak: (params.g_leak_branch1_mS_p_cm2 *
                    surfaceArea_branch1_cm2 * 1e-3),
                E_leak: params.E_leak_branch1_mV * 1e-3,
                V_rest: V_rest
            });

            if (i === 0) {
                electrophys.gapJunction(
                    trunkCompartment[numTrunkCompartments - 1],
                    branch1Compartment[i], {
                        g: 1 / r_trunk_branch1_boundary
                    });
            } else {
                electrophys.gapJunction(branch1Compartment[i - 1],
                    branch1Compartment[i], {
                        g: 1 / r_intercompartment_branch1
                    });
            }

            electrophys.hhKConductance(model,
                branch1Compartment[i], {
                    g_K: params.g_K_branch1_mS_p_cm2  * surfaceArea_branch1_cm2 * 1e-3,
                    E_K: params.E_K_branch1_mV * 1e-3,
                    V_rest: V_rest
                });

            electrophys.hhNaConductance(model,
                branch1Compartment[i], {
                    g_Na: params.g_Na_branch1_mS_p_cm2  * surfaceArea_branch1_cm2 * 1e-3,
                    E_Na: params.E_Na_branch1_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        // create the second branch
        branch2Compartment = [];
        for (i = 0; i < numBranchCompartments; i += 1) {
            branch2Compartment[i] = electrophys.passiveMembrane(model, {
                C: params.C_branch2_uF_p_cm2 * surfaceArea_branch2_cm2 * 1e-6,
                g_leak: (params.g_leak_branch2_mS_p_cm2 *
                    surfaceArea_branch2_cm2 * 1e-3),
                E_leak: params.E_leak_branch2_mV * 1e-3,
                V_rest: V_rest
            });

            if (i === 0) {
                electrophys.gapJunction(
                    trunkCompartment[numTrunkCompartments - 1],
                    branch2Compartment[i],
                    {
                        g: 1 / r_trunk_branch2_boundary
                    }
                );
            } else {
                electrophys.gapJunction(branch2Compartment[i - 1],
                    branch2Compartment[i],
                    {
                        g: 1 / r_intercompartment_branch2
                    });
            }

            electrophys.hhKConductance(model,
                branch2Compartment[i], {
                    g_K: params.g_K_branch2_mS_p_cm2  * surfaceArea_branch2_cm2 * 1e-3,
                    E_K: params.E_K_branch2_mV * 1e-3,
                    V_rest: V_rest
                });

            electrophys.hhNaConductance(model,
                branch2Compartment[i], {
                    g_Na: params.g_Na_branch2_mS_p_cm2  * surfaceArea_branch2_cm2 * 1e-3,
                    E_Na: params.E_Na_branch2_mV * 1e-3,
                    V_rest: V_rest
                });
        }

        pulseTrainTrunk = electrophys.pulseTrain({
            start: 1e-3 * params.trunkPulseStart_ms,
            width: params.trunkPulseWidth_ms * 1e-3,
            height: params.trunkPulseHeight_nA * 1e-9,
            gap: params.trunkIsi_ms * 1e-3,
            num_pulses: params.trunkNumPulses
        });
        trunkCompartment[0].addCurrent(pulseTrainTrunk);

        pulseTrainBranch1 = electrophys.pulseTrain({
            start: 1e-3 * params.branch1PulseStart_ms,
            width: params.branch1PulseWidth_ms * 1e-3,
            height: params.branch1PulseHeight_nA * 1e-9,
            gap: params.branch1Isi_ms * 1e-3,
            num_pulses: params.branch1NumPulses
        });
        branch1Compartment[numBranchCompartments - 1].addCurrent(pulseTrainBranch1);

        pulseTrainBranch2 = electrophys.pulseTrain({
            start: 1e-3 * params.branch2PulseStart_ms,
            width: params.branch2PulseWidth_ms * 1e-3,
            height: params.branch2PulseHeight_nA * 1e-9,
            gap: params.branch2Isi_ms * 1e-3,
            num_pulses: params.branch2NumPulses
        });
        branch2Compartment[numBranchCompartments - 1].addCurrent(pulseTrainBranch2);

        t_ms = [];
        v_trunk_mV = [];
        v_junction_mV = [];
        v_branch1_mV = [];
        v_branch2_mV = [];
        iStim_trunk_nA = [];
        iStim_branch1_nA = [];
        iStim_branch2_nA = [];

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
            v_trunk = trunkCompartment[0].V(result.y, result.t);
            v_junction = trunkCompartment[numTrunkCompartments - 1].V(result.y, result.t);
            v_branch1 = branch1Compartment[numBranchCompartments - 1].V(result.y, result.t);
            v_branch2 = branch2Compartment[numBranchCompartments - 1].V(result.y, result.t);

            t_ms = t_ms.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(t));
            v_trunk_mV = v_trunk_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_trunk));
            v_junction_mV = v_junction_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_junction));
            v_branch1_mV = v_branch1_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_branch1));
            v_branch2_mV = v_branch2_mV.concat(graph.linearAxis(0, 1, 0, 1000).
                    mapWorldToDisplay(v_branch2));

            iStim_trunk_nA = iStim_trunk_nA.concat(t.map(function (t) {return pulseTrainTrunk([], t) / 1e-9; }));
            iStim_branch1_nA = iStim_branch1_nA.concat(t.map(function (t) {return pulseTrainBranch1([], t) / 1e-9; }));
            iStim_branch2_nA = iStim_branch2_nA.concat(t.map(function (t) {return pulseTrainBranch2([], t) / 1e-9; }));

            // plot the results
            plotPanel = document.getElementById('BranchedCablePlots');
            plotPanel.innerHTML = '';

            title = document.createElement('h4');
            title.innerHTML = 'Membrane potential trunk (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_trunk_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML =
                'Membrane potential at junction (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_junction_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Membrane potential at branch 1 (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_branch1_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Membrane potential at branch 2 (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_branch2_mV,
                { xUnits: 'ms', yUnits: 'mV',
                    minYRange: 100,
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Stimulation current trunk (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_trunk_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Stimulation current branch 1 (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_branch1_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'Stimulation current branch 2 (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_branch2_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms,
                    xMax: params.totalDuration_ms});

            if (result.terminationReason === 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            } else if (result.terminationReason == 'reached tMax') {
                console.log('Total time: ' + (new Date().getTime() - startTime));
            } else {
                console.log('Integration error: ' + result.terminationReason);
            }
        }

        window.setTimeout(updateSim, 0);
    }


    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('BranchedCableRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('BranchedCableResetButton')
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

