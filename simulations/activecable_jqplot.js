/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, voltage1DataTable,
        voltage2DataTable, stimDataTable, tMax = 1000e-3, plotHandles = [],
        currentRunNumber = 0; 

    // set up the controls
    params = { 
        diameter_um: { label: 'Dendrite diameter', units: '\u00B5m',
            defaultVal: 2, minVal: 0.001, maxVal: 1000 },
        R_axial_ohm_cm: { label: 'Axial resistance', units: '\u03A9 cm',
            defaultVal: 36, minVal: 0.01, maxVal: 10000 },
        C_uF_p_cm2: { label: 'Membrane capacitance', units: '\u00B5F/cm\u00B2',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_mS_p_cm2: { label: 'Leak conductance', units: 'mS/cm\u00B2', 
            defaultVal: 0.3, minVal: 0.01, maxVal: 1000 }, 
        E_leak_mV: { label: 'Leak reversal potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_mS_p_cm2: { label: 'Fast transient sodium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 120, minVal: 0.01, maxVal: 1000 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_mS_p_cm2: { label: 'Delayed rectifier potassium conductance', 
            units: 'mS/cm\u00B2', defaultVal: 36, minVal: 0.01, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        dist_electrodes_um: { label: 'Distance between electrodes', 
            units: '\u00B5m', defaultVal: 3000, minVal: 500, maxVal: 10000 },
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 0.1, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 0.4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 8, minVal: 0, maxVal: tMax / 1e-3 },
        numCompartments: { label: 'Number of compartments', units: '', 
            defaultVal: 8, minVal: 4, maxVal: 100 },
        numCapSegments: { label: 'Number of capping segments', units: '', 
            defaultVal: 6, minVal: 0, maxVal: 100 },
        cappingFactor: { label: 'Capping factor', units: '', 
            defaultVal: 2, minVal: 1, maxVal: 100 }
    };
    layout = [
        ['Cell Properties', ['diameter_um', 'R_axial_ohm_cm', 'C_uF_p_cm2', 
            'g_leak_mS_p_cm2', 'E_leak_mV', 'g_Na_mS_p_cm2', 'E_Na_mV', 
            'g_K_mS_p_cm2', 'E_K_mV', 'dist_electrodes_um']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms', 'numCompartments',
            'numCapSegments', 'cappingFactor']]
    ];
    controlsPanel = document.getElementById('ActiveCableControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('ActiveCableData');
    dataPanel.className = 'datapanel';

    voltage1DataTable = document.createElement('table');
    voltage1DataTable.className = 'datatable';
    dataPanel.appendChild(voltage1DataTable);

    voltage2DataTable = document.createElement('table');
    voltage2DataTable.className = 'datatable';
    dataPanel.appendChild(voltage2DataTable);

    stimDataTable = document.createElement('table');
    stimDataTable.className = 'datatable';
    dataPanel.appendChild(stimDataTable);

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, passiveMembranes, pulseTrain,
            result, v_0, v_f, iStim,
            v_0_mV, v_f_mV, params, iStim_nA,
            plotPanel, plot, debugPanel, title, i, 
            l_segment_um, surfaceArea_cm2, crossSectionalArea_cm2, 
            r_intersegment, 
            numCapSegments, cappingFactor, prevSegment,
            factor,
            V_rest = -64.93e-3, // this is the stable resting potential after 40 ms
            startTime = new Date().getTime(),
            t0, y0, runNumber;
       
        params = controls.values;

        l_segment_um = params.dist_electrodes_um / params.numCompartments;
        surfaceArea_cm2 = Math.PI * params.diameter_um * l_segment_um * 1e-8;
        crossSectionalArea_cm2 = Math.PI * params.diameter_um * 
            params.diameter_um * 1e-8 / 4;
        r_intersegment = params.R_axial_ohm_cm * l_segment_um / 
            crossSectionalArea_cm2 * 1e-4;
        //console.log(l_segment_um + ' ' + surfaceArea_cm2 + ' ' + 
        //        crossSectionalArea_cm2 + ' ' + r_intersegment);

        numCapSegments = params.numCapSegments;
        cappingFactor = params.cappingFactor;

        // create the passive membrane
        model = componentModel.componentModel();
        passiveMembranes = [];
        
        for (i = 0; i < params.numCompartments; i += 1) {
            passiveMembranes[i] = electrophys.passiveMembrane(model, {
                C: params.C_uF_p_cm2 * surfaceArea_cm2 * 1e-6, 
                g_leak: params.g_leak_mS_p_cm2 * surfaceArea_cm2 * 1e-3, 
                E_leak: params.E_leak_mV * 1e-3,
                V_rest: V_rest
            });

            if (i > 0) {
                electrophys.gapJunction(passiveMembranes[i - 1], 
                    passiveMembranes[i], { g: 1 / r_intersegment });
            }

            electrophys.hhKConductance(model, 
                passiveMembranes[i], {
                    g_K: params.g_K_mS_p_cm2 * surfaceArea_cm2 * 1e-3,
                    E_K: params.E_K_mV * 1e-3,
                    V_rest: V_rest
                });
            
            electrophys.hhNaConductance(model, 
                passiveMembranes[i], {
                    g_Na: params.g_Na_mS_p_cm2 * surfaceArea_cm2 * 1e-3,
                    E_Na: params.E_Na_mV * 1e-3,
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
        passiveMembranes[0].addCurrent(pulseTrain);
        
        v_0_mV = [];
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
                tMinOutput: 1e-5,
                y0: y0, 
                timeout: 200
            });
            
            v_0   = result.mapOrderedPairs(passiveMembranes[0].V);
            v_f   = result.mapOrderedPairs(passiveMembranes[params.numCompartments - 1].V);
            iStim = result.mapOrderedPairs(pulseTrain);

            // convert to the right units
            // each ordered pair consists of a time and another variable
            v_0_mV = v_0_mV.concat(v_0.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_f_mV = v_f_mV.concat(v_f.map (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            iStim_nA = iStim_nA.concat(iStim.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));

            // free resources from old plots
            while (plotHandles.length > 0) {
                plotHandles.pop().destroy();
            }

            // plot the results
            plotPanel = document.getElementById('ActiveCablePlots');
            plotPanel.innerHTML = '';

            // Voltage 1
            title = document.createElement('h4');
            title.innerHTML = 'Membrane Potential at Electrode 1';
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

            // Voltage 2
            title = document.createElement('h4');
            title.innerHTML = 'Membrane Potential at Electrode 2';
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
            title.innerHTML = 'Stimulation Current at Electrode 1';
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
                //debugPanel.innerHTML = passiveMembranes[0].V(result.y, result.t)[passiveMembranes[0].V(result.y, result.t).length-1];
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

        voltage2DataTable.innerHTML = '';
        voltage2DataTable.style.display = 'none';

        stimDataTable.innerHTML = '';
        stimDataTable.style.display = 'none';
    }


    (document.getElementById('ActiveCableRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('ActiveCableResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('ActiveCableClearDataButton')
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

