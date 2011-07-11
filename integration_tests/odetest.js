// simulate and plot a simple harmonic oscillator
function plotSHO()
{
    // get the drawing surface
    var canvas = document.getElementById('SHOPlot');
    var context = canvas.getContext('2d');

    // clear the canvas
    canvas.width = canvas.width;

    // simulate the oscillator
    sho = {
        tMin: 0,
        tMax: 100,
        tMaxStep: 0.1,
        drift: function (y, t) { return [y[1], -y[0]]; }, 
        y0: [1, 0]
    };
    var result = ode.integrate(sho)
    t = result.t;
    x = result.y[0];
    v = result.y[1];

    // set up axes for the phase plane plot
    var phaseXAxis = graph.linearAxis(-1.5, 1.5, 0, 600);
    var phaseVAxis = graph.linearAxis(-1.5, 1.5, 0, 600);
    var phasePlot = graph.plotArea(phaseXAxis, phaseVAxis);

    var timeAxis = graph.linearAxis(sho.tMin, sho.tMax, 0, 600);
    var xAxis = graph.linearAxis(-1.5, 1.5, 600, 700);
    var vAxis = graph.linearAxis(-1.5, 1.5, 700, 800);
    var xPlot = graph.plotArea(timeAxis, xAxis);
    var vPlot = graph.plotArea(timeAxis, vAxis);
       
    // plot the results
    phasePlot.addXYLine(x, v);
    xPlot.addXYLine(t, x);
    vPlot.addXYLine(t, v);

    phasePlot.draw(context);
    xPlot.draw(context);
    vPlot.draw(context);
}


