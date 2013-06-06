/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, pointsPanel, pointsTable, controls, tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the current clamp simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 1, minVal: 0.01, maxVal: 100 }, 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.3, minVal: 0.001, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -54.4, minVal: -1000, maxVal: 1000 }, 
        g_Na_uS: { label: 'Fast transient sodium conductance', 
            units: '\u00B5S', defaultVal: 120, minVal: 0.01, maxVal: 1000 }, 
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 55, minVal: -1000, maxVal: 1000 }, 
        g_K_uS: { label: 'Delayed rectifier potassium conductance', 
            units: '\u00B5S', defaultVal: 36, minVal: 0.01, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -77, minVal: -1000, maxVal: 1000 }, 
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current first pulse', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseSubsequentHeight_nA: { label: 'Stimulus current subsequent pulses', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 2, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_leak_uS', 'E_leak_mV',
            'g_Na_uS', 'E_Na_mV', 'g_K_uS', 'E_K_mV']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseSubsequentHeight_nA', 'pulseWidth_ms', 'isi_ms',
            'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('CurrentClampControls');
    pointsPanel = document.getElementById('CurrentClampPoints');
    pointsPanel.className = 'pointspanel';
    pointsTable = document.createElement('table');
    pointsTable.className = 'pointstable';
    pointsPanel.appendChild(pointsTable);

    // simulate and plot an hh neuron with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain, hhNaCurrent, hhKCurrent,
            result, v, gNa, gK, iNa, iK, iLeak, mGate, hGate, nGate, iStim,
            v_mV, gNa_uS, gK_uS, iNa_nA, iK_nA, iLeak_nA, params, iStim_nA,
            plotPanel, plot, plotDefaultOptions, j, prerun, y0; 
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        neuron = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: params.g_leak_uS * 1e-6, 
            E_leak: params.E_leak_mV * 1e-3 
        });

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            subsequentHeight: params.pulseSubsequentHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        neuron.addCurrent(pulseTrain);
        
        hhKCurrent = electrophys.hhKConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3
        });
        
        hhNaCurrent = electrophys.hhNaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3
        });

        // run it for a bit to let it reach steady state
        prerun = model.integrate({
            tMin: -60e-3, 
            tMax: 0, 
            tMaxStep: 1e-4,
        });

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: 1e-4,
            y0: prerun.y_f
        });
        
        v     = result.mapOrderedPairs(neuron.V);
        gNa   = result.mapOrderedPairs(hhNaCurrent.g);
        gK    = result.mapOrderedPairs(hhKCurrent.g);
        iNa   = result.mapOrderedPairs(hhNaCurrent.current);
        iK    = result.mapOrderedPairs(hhKCurrent.current);
        iLeak = result.mapOrderedPairs(neuron.leak.current);
        mGate = result.mapOrderedPairs(hhNaCurrent.m);
        hGate = result.mapOrderedPairs(hhNaCurrent.h);
        nGate = result.mapOrderedPairs(hhKCurrent.n);
        iStim = result.mapOrderedPairs(pulseTrain);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_mV     = v.map     (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        gNa_uS   = gNa.map   (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gK_uS    = gK.map    (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        iNa_nA   = iNa.map   (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iK_nA    = iK.map    (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iLeak_nA = iLeak.map (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        mGate    = mGate.map (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate    = hGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        nGate    = nGate.map (function (n) {return [n[0] / 1e-3,  n[1]       ];});
        iStim_nA = iStim.map (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('CurrentClampPlots');
        plotPanel.innerHTML = '';
        plotDefaultOptions = {
            grid: {
                shadow: false,
            },
            legend: {
                placement: 'outside',
            },
            cursor: {
                show: true,
                zoom: true,
                looseZoom: false,
                followMouse: true,
                useAxesFormatters: false,
                showVerticalLine: true,
                showTooltipDataPosition: true,
                tooltipFormatString: "%s: %.2f, %.2f",
            },
            captureRightClick: true,
            axes: {
                xaxis: {
                    min: 0,
                    max: params.totalDuration_ms,
                    tickOptions: {formatString: '%.2f'},
                },
            },
            axesDefaults: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            },
            seriesDefaults: {
                showMarker: false,
                lineWidth: 1,
                shadow: false,
            }
        };

        // Voltage
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('voltagePlot', [v_mV], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f mV",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlot', [iNa_nA, iK_nA, iLeak_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                legend: {show: true},
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>Na</sub>',   color: 'blue'},
                    {label: 'I<sub>K</sub>',    color: 'red'},
                    {label: 'I<sub>leak</sub>', color: 'black'},
                ],
        })));

        // when the user right-clicks, append to the points table the values
        // from each series for the data points nearest (in the x-coordinate)
        // the cursor with the value of the x-coordinate
        $('#currentPlot').bind('jqplotRightClick',
            function (ev, gridpos, datapos, neighbor, plot) {
                var caption, row, cell, i, cursor_x, low, mid, high, nearest_point,
                    low_x, mid_x, high_x, nearest_point_x, nearest_point_y;

                // determine which point is closest to the cursor
                cursor_x = datapos.xaxis;
                nearest_point = -1;
                low = 0;
                high = plot.data[0].length-1;
                while (high - low > 1) {
                    mid = Math.round((low+high)/2);
                    mid_x = plot.data[0][mid][0];
                    if (mid_x <= cursor_x)
                        low = mid;
                    else
                        high = mid;
                }
                if (plot.data[0][low][0] == cursor_x) {
                    high = low;
                    nearest_point = high;
                } else {
                    low_x = plot.data[0][low][0];
                    high_x = plot.data[0][high][0];
                    if (Math.abs(low_x - cursor_x) < Math.abs(high_x - cursor_x))
                        nearest_point = low;
                    else
                        nearest_point = high;   
                }

                // if a table heading does not already exist, create it
                if (!pointsTable.firstChild) {
                    caption = document.createElement('caption');
                    caption.className = 'pointstablecaption';
                    caption.innerHTML = 'Currents';
                    pointsTable.appendChild(caption);

                    row = document.createElement('tr');
                    pointsTable.appendChild(row);

                    cell = document.createElement('td');
                    cell.className = 'pointstableheading';
                    cell.innerHTML = 'Time';
                    row.appendChild(cell);

                    for (i=0; i<plot.data.length; i++) {
                        cell = document.createElement('td');
                        cell.className = 'pointstableheading';
                        cell.innerHTML = plot.series[i].label;
                        row.appendChild(cell);
                    }
                }

                // create a new table row for the captured point
                row = document.createElement('tr');
                pointsTable.appendChild(row);

                // add the x-coordinate value to the table
                nearest_point_x = plot.data[0][nearest_point][0];
                cell = document.createElement('td');
                cell.innerHTML = Math.round(nearest_point_x*100)/100;
                row.appendChild(cell);

                // add each series value to the table
                for (i=0; i<plot.data.length; i++) {
                    nearest_point_y = plot.data[i][nearest_point][1];
                    cell = document.createElement('td');
                    cell.innerHTML = Math.round(nearest_point_y*100)/100;
                    row.appendChild(cell);
                }
            }
        );

        // create a cursor tooltip that displays the values from each series
        // for the data points nearest (in the x-coordinate) the cursor with
        // the value of the x-coordinate
        $('#currentPlot').bind('jqplotMouseMove',
            function (ev, gridpos, datapos, neighbor, plot) {
                var tooltipHTML, i, cursor_x, low, mid, high, nearest_point,
                    low_x, mid_x, high_x, nearest_point_x, nearest_point_y;
                
                // determine which point is closest to the cursor
                cursor_x = datapos.xaxis;
                nearest_point = -1;
                low = 0;
                high = plot.data[0].length-1;
                while (high - low > 1) {
                    mid = Math.round((low+high)/2);
                    mid_x = plot.data[0][mid][0];
                    if (mid_x <= cursor_x)
                        low = mid;
                    else
                        high = mid;
                }
                if (plot.data[0][low][0] == cursor_x) {
                    high = low;
                    nearest_point = high;
                } else {
                    low_x = plot.data[0][low][0];
                    high_x = plot.data[0][high][0];
                    if (Math.abs(low_x - cursor_x) < Math.abs(high_x - cursor_x))
                        nearest_point = low;
                    else
                        nearest_point = high;   
                }

                // clear the tooltip
                tooltipHTML = '';

                // add the x-coordinate value to the tooltip
                nearest_point_x = plot.data[0][nearest_point][0];
                tooltipHTML = tooltipHTML + "Time: " + Math.round(nearest_point_x*100)/100 + " ms";

                // add each series value to the tooltip
                for (i=0; i<plot.data.length; i++) {
                    nearest_point_y = plot.data[i][nearest_point][1];
                    tooltipHTML = tooltipHTML + "<br/>" + plot.series[i].label + ": " + Math.round(nearest_point_y*100)/100 + " nA";
                }

                // display the tooltip
                $(".jqplot-cursor-tooltip").html(tooltipHTML);
            }
        );

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlot', [gNa_uS, gK_uS], jQuery.extend(true, {}, plotDefaultOptions, {
                legend: {show: true},
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f \u00B5S",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>Na</sub>', color: 'blue'},
                    {label: 'g<sub>K</sub>',  color: 'red'},
                ],
        })));

        // Gates
        plot = document.createElement('div');
        plot.id = 'gatePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlot', [mGate, hGate, nGate], jQuery.extend(true, {}, plotDefaultOptions, {
                legend: {show: true},
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'm', color: 'blue'},
                    {label: 'h', color: 'navy'},
                    {label: 'n', color: 'red'},
                ],
        })));

        // Stimulus current
        plot = document.createElement('div');
        plot.id = 'stimPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('stimPlot', [iStim_nA], jQuery.extend(true, {}, plotDefaultOptions, {
                cursor: {
                    tooltipFormatString: "%s: %.2f ms, %.2f nA",
                },
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Stimulation Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
                ],
        })));
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearPoints() {
        pointsTable.innerHTML = '';
    }


    (document.getElementById('CurrentClampRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('CurrentClampResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('CurrentClampClearPointsButton')
        .addEventListener('click', clearPoints, false));
    

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

