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
            lines = [], delta = 10; 
         
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

    function addText(x, y, text) {
        var obj, elem;
        
        elem = document.createElementNS(svgns, 'text');
        elem.setAttribute('x', xAxis.mapWorldToDisplay(x));
        elem.setAttribute('y', yAxis.mapWorldToDisplay(y));
        elem.innerHTML = text;
        svg.appendChild(elem);

        obj = [[elem], "text", x, y, text];
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
    //svg.setAttribute('width', 200);
    //svg.setAttribute('heigth', 200);
    //svg.setAttribute('viewBox', "0 0 200 200");
    //svg.height=100;
    //svg.version="1.1";
    //svg.viewbox="0 0 100 100";
    //panel && panel.appendChild(svg); // TODO: remove &&

    return {
        addXYLine : addXYLine,
        addPoints : addPoints,
        addText : addText,
        remove : remove,
        draw : draw,
    };
};

