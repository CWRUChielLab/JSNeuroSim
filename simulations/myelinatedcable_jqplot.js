/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, voltage1DataTable,
        voltageMyelinatedDataTable, voltage2DataTable, stimDataTable,
        tMax = 1000e-3, plotHandles = [], currentRunNumber = 0; 

    // set up the controls for the passive membrane simulation
    params = { 

        diameter_node_um: { label: 'Axon diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_node_ohm_cm: { label: 'Intracellular resistivity', units: '\u03A9 cm',
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
        len_node_um: { label: 'Node length', 
            units: '\u00B5m', defaultVal: 100, minVal: 0.1, maxVal: 100 },

        diameter_myelin_um: { label: 'Axon diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_myelin_ohm_cm: { label: 'Intracellular resistivity', units: '\u03A9 cm',
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
        len_myelin_um: { label: 'Internodal distance', 
            units: '\u00B5m', defaultVal: 6000, minVal: 100, maxVal: 10000000 },

        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 2, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
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

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MyelinatedCableData');
    dataPanel.className = 'datapanel';

    voltage1DataTable = document.createElement('table');
    voltage1DataTable.className = 'datatable';
    dataPanel.appendChild(voltage1DataTable);

    voltageMyelinatedDataTable = document.createElement('table');
    voltageMyelinatedDataTable.className = 'datatable';
    dataPanel.appendChild(voltageMyelinatedDataTable);

    voltage2DataTable = document.createElement('table');
    voltage2DataTable.className = 'datatable';
    dataPanel.appendChild(voltage2DataTable);

    stimDataTable = document.createElement('table');
    stimDataTable.className = 'datatable';
    dataPanel.appendChild(stimDataTable);

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, leftNodeCompartment, rightNodeCompartment, 
            myelinatedCompartment, pulseTrain,
            result, v_0, v_c, v_f, iStim,
            v_0_mV, v_c_mV, v_f_mV, params, iStim_nA,
            plotPanel, plot, debugPanel, title, i, 
            l_compartment_myelin_um, surfaceArea_myelin_cm2, 
            crossSectionalArea_myelin_cm2, 
            r_intercompartment_myelin, 
            l_compartment_node_um, surfaceArea_node_cm2, 
            crossSectionalArea_node_cm2, 
            r_intercompartment_node, 
            r_intercompartment_boundary, 
            V_rest = -63.32e-3, // this is the stable resting potential after 40 ms
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
                timeout: 200
            });
            
            v_0   = result.mapOrderedPairs(leftNodeCompartment[0].V);
            v_c   = result.mapOrderedPairs(myelinatedCompartment[
                Math.floor(numMyelinatedCompartments / 2)
            ].V);
            v_f   = result.mapOrderedPairs(rightNodeCompartment[0].V);
            iStim = result.mapOrderedPairs(pulseTrain);

            // convert to the right units
            // each ordered pair consists of a time and another variable
            v_0_mV = v_0_mV.concat(v_0.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_c_mV = v_c_mV.concat(v_c.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_f_mV = v_f_mV.concat(v_f.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            iStim_nA = iStim_nA.concat(iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9];}));

            // free resources from old plots
            while (plotHandles.length > 0) {
                plotHandles.pop().destroy();
            }

            // plot the results
            plotPanel = document.getElementById('MyelinatedCablePlots');
            plotPanel.innerHTML = '';
            
            // Voltage 1
            title = document.createElement('h4');
            title.innerHTML = 'Membrane Potential at Node 1';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltage1Plot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltage1Plot', [v_0_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltage1Plot', voltage1DataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltage1Plot', 'Time', 'ms', 'mV');

            // Voltage myelinated
            title = document.createElement('h4');
            title.innerHTML = 'Membrane Potential at Myelinated Segment';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageMyelinatedPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageMyelinatedPlot', [v_c_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageMyelinatedPlot', voltageMyelinatedDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageMyelinatedPlot', 'Time', 'ms', 'mV');

            // Voltage 2
            title = document.createElement('h4');
            title.innerHTML = 'Membrane Potential at Node 2';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltage2Plot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltage2Plot', [v_f_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltage2Plot', voltage2DataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltage2Plot', 'Time', 'ms', 'mV');

            // Stimulus current
            title = document.createElement('h4');
            title.innerHTML = 'Stimulation Current at Node 1';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'stimPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('stimPlot', [iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#stimPlot', stimDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#stimPlot', 'Time', 'ms', 'nA');

            if (result.terminationReason === 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            } else {
                console.log('Total time: ' + (new Date().getTime() - startTime));
                debugPanel = document.getElementById('debugPanel');
                //debugPanel.innerHTML = leftNodeCompartment[0].V(result.y, result.t)[leftNodeCompartment[0].V(result.y, result.t).length-1];
            }
        }

        window.setTimeout(updateSim, 0);
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearDataTables() {
        voltage1DataTable.innerHTML = '';
        voltage1DataTable.style.display = 'none';

        voltageMyelinatedDataTable.innerHTML = '';
        voltageMyelinatedDataTable.style.display = 'none';

        voltage2DataTable.innerHTML = '';
        voltage2DataTable.style.display = 'none';

        stimDataTable.innerHTML = '';
        stimDataTable.style.display = 'none';
    }


    (document.getElementById('MyelinatedCableRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MyelinatedCableResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('MyelinatedCableClearDataButton')
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

