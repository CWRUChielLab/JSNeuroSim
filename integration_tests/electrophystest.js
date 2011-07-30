// simulate and plot a passive membrane with a pulse
function plotPassiveMembrane()
{
    // get the drawing surface
    var canvas = document.getElementById('PassiveMembranePlot');
    var context = canvas.getContext('2d');

    // clear the canvas
    canvas.width = canvas.width;

    // create the passive membrane
    var model = componentModel.componentModel();
    var passiveMembrane = electrophys.passiveMembrane(model, 
        { C: 2e-9, g_leak: 1e-6, E_leak: -65e-3 });

    passiveMembrane.addCurrent(electrophys.pulse(
        {start: 15e-3, width: 10e-3, height: 10e-9}));
    
    // simulate it
    var result = model.integrate({tMin: 0, tMax: 50e-3});
    var t = result.t;
    var v = passiveMembrane.V(result.y, result.t);

    // set up axes for the plot
    var timeAxis = graph.linearAxis(t[0], t[t.length-1], 0, 500);
    var vAxis = graph.linearAxis(-70e-3, -50e-3, 200, 0);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    vPlot.addXYLine(t, v);
    vPlot.draw(context);
}


// simulate and plot the C2 neuron from Calin-Jageman et al 2007
function plotC2()
{
    // get the drawing surface
    var canvas = document.getElementById('C2Plot');
    var context = canvas.getContext('2d');

    // clear the canvas
    canvas.width = canvas.width;

    // create the passive membrane
    var model = componentModel.componentModel();
    var C2 = electrophys.gettingIFNeuron(model, 
        { C: 2.27e-9, g_leak: 1/23.3e6, E_leak: -48e-3, 
            theta_ss: -34e-3, theta_r: 0e-3, theta_tau: 65.0e-3 });
    var C2Fast = electrophys.gettingSynapse(model, C2, C2, 
        { W: 0.12000e-6, E_rev: -80e-3, tau_open:   10e-3, tau_close:   30e-3 });
    var C2Med = electrophys.gettingSynapse(model, C2, C2, 
        { W: 0.02800e-6, E_rev: -80e-3, tau_open:   10e-3, tau_close: 1200e-3 });
    var C2Slow = electrophys.gettingSynapse(model, C2, C2, 
        { W: 0.00300e-6, E_rev: -80e-3, tau_open: 4000e-3, tau_close: 4000e-3 });

    C2.addCurrent(electrophys.pulse(
        {start: 1, width: 5, height: 2e-9}));
    
    // simulate it
    var result = model.integrate({tMin: 0, tMax: 7, tMaxStep: 2e-3});
    var t = result.t;
    var v = C2.VWithSpikes(result.y, result.t);

    // set up axes for the plot
    var timeAxis = graph.linearAxis(t[0], t[t.length-1], 0, 500);
    var vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    vPlot.addXYLine(t, v);
    vPlot.draw(context);
}


// simulate and plot the DSI neuron from Calin-Jageman et al 2007
function plotDSI()
{
    // get the drawing surface
    var canvas = document.getElementById('DSIPlot');
    var context = canvas.getContext('2d');

    // clear the canvas
    canvas.width = canvas.width;

    // create the passive membrane
    var model = componentModel.componentModel();
    var DSI = electrophys.gettingIFNeuron(model, 
        { C: 1.5714765e-9, g_leak: 1/38.8e6, E_leak: -47.5e-3, 
            theta_ss: -50e-3, theta_r: 200e-3, theta_tau: 15.0e-3 });
    var DSIShunt = electrophys.gettingShuntConductance(model, DSI,
        { G: 0.08e-6, E_rev: -47.5e-3, B_m: 29e-3, C_m: -1e-3, tau_m: 10e-3,
                B_h: -100e-3, C_h: 1e-3, tau_h: 100000e-3 });
        //{ G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
        //        B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3 });
    var DSIFast = electrophys.gettingSynapse(model, DSI, DSI, 
        { W: 0.30000e-6, E_rev: -80e-3, tau_open:   10e-3, tau_close:   85e-3 });
    var DSISlow = electrophys.gettingSynapse(model, DSI, DSI, 
        { W: 0.01200e-6, E_rev: -80e-3, tau_open:  200e-3, tau_close: 2800e-3 });

    DSI.addCurrent(electrophys.pulse(
        {start: 0.5, width: 5, height: 3e-9}));
    
    // simulate it
    var result = model.integrate({tMin: -0.6, tMax: 7, tMaxStep: 2e-3});
    var t = result.t;
    var v = DSI.VWithSpikes(result.y, result.t);

    // set up axes for the plot
    var timeAxis = graph.linearAxis(0, t[t.length-1], 0, 500);
    var vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    vPlot.addXYLine(t, v);
    vPlot.draw(context);
}


// simulate and plot the VSI neuron from Calin-Jageman et al 2007
function plotVSI()
{
    // get the drawing surface
    var canvas = document.getElementById('VSIPlot');
    var context = canvas.getContext('2d');

    // clear the canvas
    canvas.width = canvas.width;

    // create the passive membrane
    var model = componentModel.componentModel();
    var VSI = electrophys.gettingIFNeuron(model, 
        { C: 3.2e-9, g_leak: 1/14e6, E_leak: -56e-3, 
            theta_ss: -38e-3, theta_r: 10e-3, theta_tau: 10.0e-3 });
    var VSIShunt = electrophys.gettingShuntConductance(model, VSI,
        { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3 });
    var VSIFast = electrophys.gettingSynapse(model, VSI, VSI, 
        { W: 0.54000e-6, E_rev: -80e-3, tau_open:   10e-3, tau_close:  100e-3 });
    var VSISlow = electrophys.gettingSynapse(model, VSI, VSI, 
        { W: 0.00460e-6, E_rev: -80e-3, tau_open: 1000e-3, tau_close: 2500e-3 });

    VSI.addCurrent(electrophys.pulse(
        {start: 0.5, width: 5, height: 2.5e-9}));

    // simulate it
    var result = model.integrate({tMin: -0.6, tMax: 7, tMaxStep: 2e-3});
    var t = result.t;
    var v = VSI.VWithSpikes(result.y, result.t);

    // set up axes for the plot
    var timeAxis = graph.linearAxis(0, t[t.length-1], 0, 500);
    var vAxis = graph.linearAxis(-80e-3, 55e-3, 200, 0);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    vPlot.addXYLine(t, v);
    vPlot.draw(context);
}


