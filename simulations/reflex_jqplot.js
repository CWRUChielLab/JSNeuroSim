/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, lengthDataTable,
        forceDataTable, voltageDataTable, touchStimDataTable,
        tMax = 10000e-3, plotHandles = []; 

    // set up the controls
    params = {
        Linit_cm: { label: 'Initial length', units: 'cm',
            defaultVal: 5.0, minVal: 2.5, maxVal: 12.0 },
        m_g: { label: 'Mass', units: 'g',
            defaultVal: 100, minVal: 1, maxVal: 10000.0 },
        B_ms_cm: { label: 'Force-velocity constant', units: 'ms/cm',
            defaultVal: 20, minVal: 0, maxVal: 10000.0 },
        beta_g_ms: { label: 'Damping constant', units: 'g/ms',
            defaultVal: 50, minVal: 0, maxVal: 10000.0 },
        activation_tau: { label: 'Activation time constant', units: 'ms',
            defaultVal: 150, minVal: 0.1, maxVal: 10000.0 },

        reflexTrigger_cm: { label: 'Trigger length', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        reflexConstant_cm: { label: 'Activation length constant', units: 'cm',
            defaultVal: 10, minVal: 0.1, maxVal: 10000.0 },

        Lrestspring: { label: 'Spring resting position', units: 'cm',
            defaultVal: 6.0, minVal: 2.5, maxVal: 12.0 },
        k: { label: 'Spring stiffness', units: 'N/cm',
            defaultVal: 0.01, minVal: 0, maxVal: 10.0 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 2000, minVal: 0, maxVal: tMax / 1e-3 },
    };

    layout = [
        ['Muscle Properties', ['Linit_cm', 'm_g', 'B_ms_cm', 'beta_g_ms', 'activation_tau']],
        ['Reflex Properties', ['reflexTrigger_cm', 'reflexConstant_cm']],
        ['Spring Properties', ['Lrestspring', 'k']],
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

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var params, model, muscle,
            result, L, Lprime, force,
            plotPanel, title, plot; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();

        muscle = electrophys.muscleFullDynamics(model, {
            Linit: params.Linit_cm,
            m: params.m_g,
            B: params.B_ms_cm * 1e-3,
            beta: params.beta_g_ms * 1e3,
            p: 1 / params.activation_tau * 1e3,
            Lrestspring: params.Lrestspring,
            k: params.k
        });

        // create a proprioceptive feedback loop
        muscle.setNeuralInput(function (state, t) {
            return Math.max(0, 1/params.reflexConstant_cm * (muscle.L(state, t) - params.reflexTrigger_cm));
            //if (muscle.L(state, t) > params.reflexTrigger_cm)
            //    return 1;
            //else
            //    return 0;
        });
        
        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-3
        });
        
        L      = result.mapOrderedPairs(muscle.L);
        Lprime = result.mapOrderedPairs(muscle.Lprime);
        force  = result.mapOrderedPairs(muscle.force);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        L      = L.map      (function (l) {return [l[0] / 1e-3, l[1]       ];});
        Lprime = Lprime.map (function (v) {return [v[0] / 1e-3, v[1] / 1e3 ];});
        force  = force.map  (function (f) {return [f[0] / 1e-3, f[1] / 1e-3];});

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
                        min: 0,
                    },
                },
                series: [
                    {label: 'Length', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#lengthPlot', lengthDataTable, 'Muscle Length', 'Time');
        graphJqplot.bindCursorTooltip('#lengthPlot', 'Time', 'ms', 'cm');

//        // Muscle velocity
//        plot = document.createElement('div');
//        plot.id = 'velocityPlot';
//        plot.style.width = '425px';
//        plot.style.height = '200px';
//        plotPanel.appendChild(plot);
//        plotHandles.push(
//            $.jqplot('velocityPlot', [Lprime], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
//                axes: {
//                    xaxis: {label:'Time (ms)'},
//                    yaxis: {label:'Velocity (cm/ms)'},
//                },
//                series: [
//                    {label: 'Length', color: 'black'},
//                ],
//        })));
//        //graphJqplot.bindDataCapture('#lengthPlot', lengthDataTable, 'Muscle Length', 'Time');
//        graphJqplot.bindCursorTooltip('#velocityPlot', 'Time', 'ms', 'cm/ms');

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
    }


    (document.getElementById('ReflexRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('ReflexResetButton')
        .addEventListener('click', resetToDefaultSim, false));
    (document.getElementById('ReflexClearDataButton')
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

    resetToDefaultSim();
    clearDataTables();

}, false);

