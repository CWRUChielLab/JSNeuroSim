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


graph.plotArea = function (xAxis, yAxis, panel) {
    "use strict";
    var canvasDrawnObjects = [], 
        graphObjects = [],
        svg;
    
    function addXYLine(xs, ys) {
        var obj, elem, xDisplay, yDisplay, points = '', i, x, y,
            polylines = []; 
         
        xDisplay = xAxis.mapWorldToDisplay(xs);
        yDisplay = yAxis.mapWorldToDisplay(ys);
        for (i = 0; i < xDisplay.length + 1; ++i) {
            x = xDisplay[i];
            y = yDisplay[i];

            if (isFinite(x) && isFinite(y)) {
                points += x + "," + y + " ";
            } else {
                if (points.length > 0) {
                    elem = document.createElement('polyline');
                    elem.fill = 'none';
                    elem.stroke = 'black';
                    elem.points = points;
                    svg.appendChild(elem);

                    polylines.push(elem);
                }
                points = '';
            }
        }

        graphObjects.push([polylines, "xyLine", xs, ys]);

        obj = ["xyLine", xs, ys];
        canvasDrawnObjects.push(obj);

        return obj;
    }

    function addPoints(xs, ys) {
        var obj, elem, xDisplay, yDisplay, i, x, y,
            lines = [], delta = 10; 
         
        xDisplay = xAxis.mapWorldToDisplay(xs);
        yDisplay = yAxis.mapWorldToDisplay(ys);
        for (i = 0; i < xDisplay.length; ++i) {
            x = xDisplay[i];
            y = yDisplay[i];

            if (isFinite(x) && isFinite(y)) {
                elem = document.createElement('line');
                elem.fill = 'none';
                elem.stroke = 'black';
                elem.x1 = x;
                elem.y1 = y - delta;
                elem.x2 = x;
                elem.y2 = y + delta;
                svg.appendChild(elem);
                lines.push(elem);

                elem = document.createElement('line');
                elem.fill = 'none';
                elem.stroke = 'black';
                elem.x1 = x - delta;
                elem.y1 = y;
                elem.x2 = x + delta;
                elem.y2 = y;
                svg.appendChild(elem);
                lines.push(elem);
            }
        }

        graphObjects.push([lines, "points", xs, ys]);

        obj = ["points", xs, ys];
        canvasDrawnObjects.push(obj);

        return obj;
    }

    function addText(x, y, text) {
        var obj, elem;
        
        elem = document.createElement('text');
        elem.x = xAxis.mapWorldToDisplay(x);
        elem.y = yAxis.mapWorldToDisplay(y);
        elem.innerHTML = text;
        svg.appendChild(elem);

        graphObjects.push([elem, "text", x, y, text]);

        obj = ["text", x, y, text];
        canvasDrawnObjects.push(obj);
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
        
        for (i = 0; i < canvasDrawnObjects.length; i += 1) {
            if (canvasDrawnObjects[i][0] === "xyLine") {
                xDisplay = xAxis.mapWorldToDisplay(canvasDrawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(canvasDrawnObjects[i][2]);
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
            
            } else if (canvasDrawnObjects[i][0] === "points") {
                xDisplay = xAxis.mapWorldToDisplay(canvasDrawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(canvasDrawnObjects[i][2]);

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
            
            } else if (canvasDrawnObjects[i][0] === "text") {
            
                xDisplay = xAxis.mapWorldToDisplay(canvasDrawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(canvasDrawnObjects[i][2]);
                text = canvasDrawnObjects[i][3];
                
                context.fillText(text, xDisplay, yDisplay);
            }            
        } 

        context.restore();
    }

    function remove(obj) {
        var i;

        // this is O(N), but could be rewritten to be O(log(N)) if needed
        for (i = 0; i < canvasDrawnObjects.length; i += 1) {
            if (canvasDrawnObjects[i] === obj) {
                canvasDrawnObjects.splice(i, 1);
            }
        }
    }

    svg = document.createElement('svg');
    panel && panel.appendChild(svg); // TODO: remove &&

    return {
        addXYLine : addXYLine,
        addPoints : addPoints,
        addText : addText,
        remove : remove,
        draw : draw,
    };
};

