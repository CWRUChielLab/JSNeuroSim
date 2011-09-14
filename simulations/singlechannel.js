/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';
    
    var params, layout, controlsPanel, controls, tMax = 1000e-3; 

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
            defaultVal: 0.5, minVal: 0, maxVal: tMax / 1e-3 },
        V_step_mV: { label: 'Step potential', units: 'mV', 
            defaultVal: 100, minVal: -1000, maxVal: 1000 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Channel Properties', ['m_gates', 'h_gates', 'E_rev_mV', 
            'g_channel_pS']],
        ['Voltage Clamp', ['V_hold_mV', 't_step_ms', 'V_step_mV']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('SingleChannelControls');


    // simulate and plot a simple harmonic oscillator
    function runSimulation() {

        var params = controls.values, t, m_gates, h_gates, channel_open, V, I,
            eventTimeFuncs = [], eventFuncs = [], 
            t_next, t_event, nextEventFunc, done = false, i, j,
            plotPanel, results, title;

        // set up the simulation
        j = 0;
        params = controls.values;
        t = [0];
        m_gates = [];
        for (i = 0; i < params.m_gates; i += 1) {
            m_gates[i] = [0];
        }
        h_gates = [];
        for (i = 0; i < params.h_gates; i += 1) {
            h_gates[i] = [1];
        }
        V = [params.V_hold_mV * 1e-3];
        channel_open = [1];
        for (i = 0; i < params.m_gates; i += 1) {
            if (!m_gates[i][j]) {
                channel_open[j] = 0;
            }
        }
        for (i = 0; i < params.h_gates; i += 1) {
            if (!h_gates[i][j]) {
                channel_open[j] = 0;
            }
        }
        I = [channel_open[j] * (V[j] - params.E_rev_mV * 1e-3) *
            params.g_channel_pS * 1e-12];
        
        function alpha_m(V) {
            return 0.1e6 * (-40e-3 - V) / 
                (Math.exp((-40e-3 - V) / 10e-3) - 1);
        }

        function beta_m(V) {
            return 4e6 * Math.exp((-65e-3 - V) / 18e-3);
        }

        function alpha_h(V) {
            return 0.07e6 * Math.exp((-65e-3 - V) / 20e-3);
        }

        function beta_h(V) {
            return 1e3 / 
                (Math.exp((-35e-3 - V) / 10e-3) + 1);
        }

        // add the "end simulation" event
        eventTimeFuncs.push(function (t) { 
            return params.totalDuration_ms * 1e-3; 
        });
        eventFuncs.push(function (t) { 
            done = true;
        });
        
        // add the voltage step event
        eventTimeFuncs.push(function (t) { 
            if (t < params.t_step_ms * 1e-3) {
                return params.t_step_ms * 1e-3;
            } else {
                return Infinity;
            }
        });
        eventFuncs.push(function (t) { 
            V[V.length - 1] = params.V_step_mV * 1e-3;
        });

        // add the activation gate change events
        function eventTimeFuncM(i) {
            return function (t) {
                var rate;
                if (m_gates[i][m_gates[i].length - 1]) {
                    rate = beta_m(V[V.length - 1]);
                } else {
                    rate = alpha_m(V[V.length - 1]);
                }
                return -Math.log(Math.random()) / rate + t;
            };
        }
        function eventFuncM(i) {
            return function (t) {
                if (m_gates[i][m_gates[i].length - 1]) {
                    m_gates[i][m_gates[i].length - 1] = 0;
                } else {
                    m_gates[i][m_gates[i].length - 1] = 1;
                }
            };
        }
        for (i = 0; i < params.m_gates; i += 1) {
            eventTimeFuncs.push(eventTimeFuncM(i));
            eventFuncs.push(eventFuncM(i));
        }

        // add the inactivation gate change events
        function eventTimeFuncH(i) {
            return function (t) {
                var rate;
                if (h_gates[i][h_gates[i].length - 1]) {
                    rate = beta_h(V[V.length - 1]);
                } else {
                    rate = alpha_h(V[V.length - 1]);
                }
                return -Math.log(Math.random()) / rate + t;
            };
        }
        function eventFuncH(i) {
            return function (t) {
                if (h_gates[i][h_gates[i].length - 1]) {
                    h_gates[i][h_gates[i].length - 1] = 0;
                } else {
                    h_gates[i][h_gates[i].length - 1] = 1;
                }
            };
        }
        for (i = 0; i < params.h_gates; i += 1) {
            eventTimeFuncs.push(eventTimeFuncH(i));
            eventFuncs.push(eventFuncH(i));
        }


        // simulate the channel
        while (!done) {
            t_next = Infinity;
            for (i = 0; i < eventTimeFuncs.length; i += 1) {
                t_event = eventTimeFuncs[i](t[j]);
                if (t_event < t_next) {
                    t_next = t_event;
                    nextEventFunc = eventFuncs[i];
                }
            }

            j += 2;
            t[j - 1] = t_next;
            t[j] = t_next;

            for (i = 0; i < params.m_gates; i += 1) {
                m_gates[i][j - 1] = m_gates[i][j - 2];
                m_gates[i][j] = m_gates[i][j - 2];
            }
            for (i = 0; i < params.h_gates; i += 1) {
                h_gates[i][j - 1] = h_gates[i][j - 2];
                h_gates[i][j] = h_gates[i][j - 2];
            }
            V[j - 1] = V[j - 2];
            V[j] = V[j - 2];
   
            nextEventFunc();
   
            channel_open[j - 1] = channel_open[j - 2];
            channel_open[j] = 1;
            for (i = 0; i < params.m_gates; i += 1) {
                if (!m_gates[i][j]) {
                    channel_open[j] = 0;
                }
            }
            for (i = 0; i < params.h_gates; i += 1) {
                if (!h_gates[i][j]) {
                    channel_open[j] = 0;
                }
            }
            I[j - 1] = I[j - 2];
            I[j] = [channel_open[j] * (V[j] - params.E_rev_mV * 1e-3) *
                params.g_channel_pS * 1e-12];
        }
        

        // set up the results
        results = {
            t_ms: graph.linearAxis(0, 1e-3, 0, 1).mapWorldToDisplay(t),
            I_pA: graph.linearAxis(0, 1e-12, 0, 1).mapWorldToDisplay(I),
            m_gates: m_gates,
            h_gates: h_gates,
            V_mV: graph.linearAxis(0, 1e-3, 0, 1).mapWorldToDisplay(V)
        };

        // plot the results
        plotPanel = document.getElementById('SingleChannelPlots');
        plotPanel.innerHTML = '';
        
        title = document.createElement('h4');
        title.innerHTML = 'Channel current (pA)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 70, results.t_ms, results.I_pA,
            {xUnits: 'ms', yUnits: 'pA'});

        title = document.createElement('h4');
        title.innerHTML = 'Activation gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        for (i = 0; i < results.m_gates.length; i += 1) {
            graph.graph(plotPanel, 425, 70, results.t_ms, results.m_gates[i],
                {xUnits: 'ms'});
        }

        title = document.createElement('h4');
        title.innerHTML = 'Inactivation gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        for (i = 0; i < results.h_gates.length; i += 1) {
            graph.graph(plotPanel, 425, 70, results.t_ms, results.h_gates[i],
                {xUnits: 'ms'});
        }

        title = document.createElement('h4');
        title.innerHTML = 'Clamp potential (mV)';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        graph.graph(plotPanel, 425, 70, results.t_ms, results.V_mV,
            {xUnits: 'ms', yUnits: 'mV'});
    }

    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }

    (document.getElementById('SingleChannelRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SingleChannelResetButton')
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
