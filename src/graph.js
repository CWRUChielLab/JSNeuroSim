/*jslint browser: true */
var graph = {};

graph.linearAxis = function (worldMin, worldMax, displayMin, displayMax) {
    "use strict";
    var worldLength = worldMax - worldMin,
        displayLength = displayMax - displayMin,
        worldToDisplayScale = displayLength / worldLength,
        displayToWorldScale = worldLength / displayLength;
    
    function mapWorldToDisplay(ordinates) {
        var l, i, result;
        
        if (ordinates.length) {
            result = [];
            i = l = ordinates.length;

            while (i > 0) {
                i -= 1;
                result[i] = ((ordinates[i] - worldMin) * worldToDisplayScale +
                    displayMin);
            }
        } else {
            result = ((ordinates - worldMin) * worldToDisplayScale +
                displayMin);
        }

        return result;
    }

    function mapDisplayToWorld(ordinates) {
        var l, i, result;
        
        if (ordinates.length) {
            result = [];
            i = l = ordinates.length;

            while (i > 0) {
                i -= 1;
                result[i] = ((ordinates[i] - displayMin) / worldToDisplayScale +
                    worldMin);
            }
        } else {
            result = ((ordinates - displayMin) / worldToDisplayScale +
                worldMin);
        }

        return result;
    }

    function isInDisplayRange(ordinate) {
        return ordinate <= Math.max(displayMax, displayMin) && 
            ordinate >= Math.min(displayMin, displayMax);
    }

    return {
        mapWorldToDisplay : mapWorldToDisplay,
        mapDisplayToWorld : mapDisplayToWorld,
        isInDisplayRange : isInDisplayRange,
        worldMin : function () { return worldMin; },
        worldMax : function () { return worldMax; },
        worldLength : function () { return worldLength; },
        displayMin : function () { return displayMin; },
        displayMax : function () { return displayMax; },
        displayLength : function () { return displayLength; }
    };
};


graph.plotArea = function (xAxis, yAxis, svg) {
    "use strict";
    var canvasDrawnObjects = [], 
        graphObjects = [],
        svgns = "http://www.w3.org/2000/svg";
    
    function addXYLine(xs, ys) {
        var obj, elem, xDisplay, yDisplay, points = '', i, x, y,
            polylines = []; 
         
        xDisplay = xAxis.mapWorldToDisplay(xs);
        yDisplay = yAxis.mapWorldToDisplay(ys);
        for (i = 0; i < xDisplay.length + 1; i += 1) {
            x = xDisplay[i];
            y = yDisplay[i];

            if (isFinite(x) && isFinite(y)) {
                points += x + "," + y + " ";
            } else {
                if (points.length > 0) {
                    elem = document.createElementNS(svgns, 'polyline');
                    elem.setAttribute('fill', 'none');
                    elem.setAttribute('stroke', 'black');
                    elem.setAttribute("points",  points);
                    svg.appendChild(elem);

                    polylines.push(elem);
                }
                points = '';
            }
        }

        obj = [polylines, "xyLine", xs, ys];
        graphObjects.push(obj);

        return obj;
    }

    function addPoints(xs, ys) {
        var obj, elem, xDisplay, yDisplay, i, x, y,
            lines = [], delta = 5; 
         
        xDisplay = xAxis.mapWorldToDisplay(xs);
        yDisplay = yAxis.mapWorldToDisplay(ys);
        for (i = 0; i < xDisplay.length; i += 1) {
            x = xDisplay[i];
            y = yDisplay[i];

            if (isFinite(x) && isFinite(y)) {
                elem = document.createElementNS(svgns, 'line');
                elem.setAttribute('fill', 'none');
                elem.setAttribute('stroke', 'black');
                elem.setAttribute('x1', x);
                elem.setAttribute('y1', y - delta);
                elem.setAttribute('x2', x);
                elem.setAttribute('y2', y + delta);
                svg.appendChild(elem);
                lines.push(elem);

                elem = document.createElementNS(svgns, 'line');
                elem.setAttribute('fill', 'none');
                elem.setAttribute('stroke', 'black');
                elem.setAttribute('x1', x - delta);
                elem.setAttribute('y1', y);
                elem.setAttribute('x2', x + delta);
                elem.setAttribute('y2', y);
                svg.appendChild(elem);
                lines.push(elem);
            }
        }

        obj = [lines, "points", xs, ys];
        graphObjects.push(obj);

        return obj;
    }

    function addText(x, y, text, options) {
        var obj, elem, offset;
        
        options = options || {};
        offset = options.offset || [0, 0];
        
        elem = document.createElementNS(svgns, 'text');
        elem.setAttribute('x', xAxis.mapWorldToDisplay(x) + offset[0]);
        elem.setAttribute('y', yAxis.mapWorldToDisplay(y) + offset[1]);
        if (options.vAlign) {
            elem.setAttribute('dominant-baseline', options.vAlign);
        }
        if (options.hAlign) {
            elem.setAttribute('text-anchor', options.hAlign);
        }
        if (options.fontSize) {
            elem.setAttribute('font-size', options.fontSize);
        }

        elem.appendChild(document.createTextNode(text));
        svg.appendChild(elem);

        obj = [[elem], "text", x, y, text, options];
        graphObjects.push(obj);

        return obj;
    }

    function draw(context) {
        var i, j, l, xDisplay, yDisplay, drawing, x, y, text, symbolsize;

        symbolsize = 
            Math.min(xAxis.displayLength(), yAxis.displayLength()) / 10;
        
        // make sure we save and restore the current clipping rectangle
        context.save();
        context.beginPath();
        context.rect(xAxis.displayMin(), yAxis.displayMin(), 
                xAxis.displayLength(), yAxis.displayLength());
        context.clip();
        
        for (i = 0; i < graphObjects.length; i += 1) {
            if (graphObjects[i][1] === "xyLine") {
                xDisplay = xAxis.mapWorldToDisplay(graphObjects[i][2]);
                yDisplay = yAxis.mapWorldToDisplay(graphObjects[i][3]);
                drawing = false;

                l = xDisplay.length;
                j = l;
                
                context.beginPath();
                
                
                while (j > 0) {
                    j -= 1;
                    x = xDisplay[j];
                    y = yDisplay[j];

                    if (isFinite(x) && isFinite(y)) {
                        if (drawing) {
                            context.lineTo(x, y); 
                        } else {
                            context.moveTo(x, y); 
                            drawing = true;
                        }
                    } else {
                        drawing = false;
                    }
                }
            
                context.stroke();
            
            } else if (graphObjects[i][1] === "points") {
                xDisplay = xAxis.mapWorldToDisplay(graphObjects[i][2]);
                yDisplay = yAxis.mapWorldToDisplay(graphObjects[i][3]);

                l = xDisplay.length;
                j = l;
                
                context.beginPath();
                
                while (j > 0) {
                    j -= 1;
                    x = xDisplay[j];
                    y = yDisplay[j];

                    if (isFinite(x) && isFinite(y)) {
                        context.moveTo(x - symbolsize / 2, y); 
                        context.lineTo(x + symbolsize / 2, y); 
                        context.moveTo(x, y - symbolsize / 2); 
                        context.lineTo(x, y + symbolsize / 2); 
                    }
                }
            
                context.stroke();
            
            } else if (graphObjects[i][1] === "text") {
            
                xDisplay = xAxis.mapWorldToDisplay(graphObjects[i][2]);
                yDisplay = yAxis.mapWorldToDisplay(graphObjects[i][3]);
                text = graphObjects[i][4];
                
                context.fillText(text, xDisplay, yDisplay);
            }            
        } 

        context.restore();
    }

    function remove(obj) {
        var i, j;

        // this is O(N), but could be rewritten to be O(log(N)) if needed
        for (i = 0; i < graphObjects.length; i += 1) {
            if (graphObjects[i] === obj) {
                for (j = 0; j < graphObjects[i][0].length; j += 1) {
                    svg.removeChild(graphObjects[i][0][j]);
                }

                graphObjects.splice(i, 1);
            }
        }
    }

    svg = svg || document.createElementNS(svgns, 'svg:svg');

    return {
        addXYLine : addXYLine,
        addPoints : addPoints,
        addText : addText,
        remove : remove,
        draw : draw,
    };
};

graph.graph = function (panel, width, height, xs, ys, options) {
    "use strict";
    var svg, div, 
        plotArea, xAxis, yAxis, 
        minX, maxX, lengthX, 
        minY, maxY, lengthY, yPeak, yTrough,
        crosshairs, positionText, ruleLine, lengthText, 
        xDragStart, yDragStart,
        dragging,
        xUnits, yUnits;
  
    options = options || {};
    xUnits = options.xUnits ? ' ' + options.xUnits : '';
    yUnits = options.yUnits ? ' ' + options.yUnits : '';

    div = document.createElement('div'); 
    div.style.margin = 0;
    div.style.padding = 0;
    panel.appendChild(div);

    svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg:svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    div.appendChild(svg); 

    if (options.xMin !== undefined && options.xMax !== undefined) {
        minX = options.xMin;
        maxX = options.xMax;
    } else {
        minX = xs.reduce(function (a, b) { return a < b ? a : b; });
        maxX = xs.reduce(function (a, b) { return a > b ? a : b; });
        lengthX = maxX - minX;

        if (lengthX === 0) {
            lengthX = Math.abs(minX) * 1e-10 + 1e-30;
        }
        
        minX -= 0.02 * lengthX;
        maxX += 0.02 * lengthX;
    }


    yTrough = minY = ys.reduce(function (a, b) { return a < b ? a : b; });
    yPeak = maxY = ys.reduce(function (a, b) { return a > b ? a : b; });
    lengthY = maxY - minY;
    if (lengthY === 0) {
        lengthY = Math.abs(minY) * 1e-10 + 1e-30;
    }
    minY -= 0.05 * lengthY;
    maxY += 0.05 * lengthY;

    if (options.minYRange && 1.1 * lengthY < options.minYRange) {
        minY -= (options.minYRange - 1.1 * lengthY) / 2;
        maxY += (options.minYRange - 1.1 * lengthY) / 2;
    }

    xAxis = graph.linearAxis(minX, maxX, 45, width - 10);
    yAxis = graph.linearAxis(minY, maxY, height - 20, 10);
    plotArea = graph.plotArea(xAxis, yAxis, svg);

    plotArea.addXYLine(xs, ys);
    plotArea.addText(minX, yTrough, yTrough.toFixed(2), 
        { hAlign: 'end', vAlign: 'middle', fontSize: 11, offset: [0, 0] });
    plotArea.addText(minX, yPeak, yPeak.toFixed(2),
        { hAlign: 'end', vAlign: 'middle', fontSize: 11, offset: [0, 0] });

    dragging = false;

    function updateCrosshairs(evt, isFirstPoint) {
        var point, xDisplay, yDisplay, xWorld, yWorld, hAlign, xOffset;

        plotArea.remove(crosshairs);
        plotArea.remove(ruleLine);
        plotArea.remove(positionText);
        plotArea.remove(lengthText);

        point = evt.changedTouches ? evt.changedTouches[0] : evt;
        xDisplay = point.clientX - div.offsetLeft + window.pageXOffset;
        yDisplay = point.clientY - div.offsetTop + window.pageYOffset;
        xWorld = xAxis.mapDisplayToWorld(xDisplay);
        yWorld = yAxis.mapDisplayToWorld(yDisplay);

        if (isFirstPoint) {
            xDragStart = xWorld;
            yDragStart = yWorld;
        }

        if (xDragStart > xWorld) {
            hAlign = 'end';
            xOffset = -4;
        } else {
            hAlign = 'start';
            xOffset = 4;
        }

        crosshairs = plotArea.addPoints([xDragStart, xWorld], 
                [yDragStart, yWorld]);
        ruleLine = plotArea.addXYLine([xDragStart, xDragStart, xWorld],
            [yDragStart, yWorld, yWorld]);
        positionText = plotArea.addText(xWorld, yWorld, 
            '(' + xWorld.toFixed(2) + xUnits + ', ' 
            + yWorld.toFixed(2) + yUnits + ')',
            {hAlign: hAlign, fontSize: 11, offset: [xOffset, -2]});
        lengthText = plotArea.addText(xWorld, yWorld, 
            '\u0394(' + (xWorld - xDragStart).toFixed(2) + xUnits + ', ' 
            + (yWorld - yDragStart).toFixed(2) + yUnits + ')',
            {hAlign: hAlign, fontSize: 11, offset: [xOffset, 10]});
    }

    function drag(evt, element) {
        evt.preventDefault();
        updateCrosshairs(evt, false);
    }

    function endDrag(evt, element) {
        evt.preventDefault();
        dragging = false;
        window.removeEventListener('mousemove', drag, false);
        window.removeEventListener('mouseup', endDrag, false);
        window.removeEventListener('touchmove', drag, false);
        window.removeEventListener('touchend', endDrag, false);
        window.removeEventListener('touchcancel', endDrag, false);
        updateCrosshairs(evt, false);
    }

    function startDrag(evt, element) {
        dragging = true;
        window.addEventListener('mousemove', drag, false);
        window.addEventListener('mouseup', endDrag, false);
        window.addEventListener('touchmove', drag, false);
        window.addEventListener('touchend', endDrag, false);
        window.addEventListener('touchcancel', endDrag, false);
        evt.preventDefault();
        updateCrosshairs(evt, true);
    }

    svg.addEventListener('mousedown', startDrag, false);
    svg.addEventListener('touchstart', startDrag, false);

    return {
        xAxis: xAxis,
        yAxis: yAxis,
        plotArea: plotArea
    };
};

