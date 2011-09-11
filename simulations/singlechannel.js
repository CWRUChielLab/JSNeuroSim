/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';
    
    var params, layout, panel, controls, tMax = 1000e-3; 

    // set up the controls for the passive membrane simulation
    params = { 
        m_gates: { label: 'Number of activation gates', 
            defaultVal: 3, minVal: 0, maxVal: 10 },
        h_gates: { label: 'Number of inactivation gates', 
            defaultVal: 1, minVal: 0, maxVal: 10 },
        E_rev_mV: { label: 'Channel reversal potential', units: 'mV',
            defaultVal: 0, minVal: -1000, maxVal: 1000 }, 
        g_channel_pS: { label: 'Open channel conductance', units: 'pS', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },

        V_hold_mV: { label: 'Holding potential', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        t_step_ms: { label: 'Step delay', units: 'ms', 
            defaultVal: 0.5, minVal: 0, maxVal: tMax },
        V_step_mV: { label: 'Step potential', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Channel Properties', ['m_gates', 'h_gates', 'E_rev_mV', 
            'g_channel_pS']],
        ['Voltage Clamp', ['V_hold_mV', 't_step_ms', 'V_step_mV']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    panel = document.getElementById('SingleChannelControls');


    // simulate and plot a simple harmonic oscillator
    function runSimulation() {

        var sho, result, t, x, v, 
            phaseXAxis, phaseVAxis, phasePlot,
            timeAxis, xAxis, vAxis, xPlot, vPlot,
            plotPanel;

        // simulate the oscillator
        sho = {
            tMin: 0,
            tMax: 100,
            tMaxStep: 0.1,
            drift: function (y, t) { return [y[1], -y[0]]; }, 
            y0: [1, 0]
        };
        result = ode.integrate(sho);
        t = result.t;
        x = result.y[0];
        v = result.y[1];

        // plot the results
        plotPanel = document.getElementById('SingleChannelPlots');
        plotPanel.innerHTML = '';
        graph.graph(plotPanel, 400, 400, x, v);
        plotPanel.appendChild(document.createElement('br'));
        graph.graph(plotPanel, 400, 100, t, x);
        plotPanel.appendChild(document.createElement('br'));
        graph.graph(plotPanel, 400, 100, t, v);
    }

    function reset() {
        panel.innerHTML = '';
        controls = simcontrols.controls(panel, params, layout);
        runSimulation();
    }

    (document.getElementById('SingleChannelRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SingleChannelResetButton')
        .addEventListener('click', reset, false));
    
    // make the enter key run the simulation  
    panel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    reset();
   
}, false);
