// simulate and plot a simple harmonic oscillator
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
    var timeAxis = graph.linearAxis(t[0], t[t.length-1], 0, 400);
    var vAxis = graph.linearAxis(-70e-3, -50e-3, 100, 0);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    vPlot.addXYLine(t, v);
    vPlot.draw(context);
}


