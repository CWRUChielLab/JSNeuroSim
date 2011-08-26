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


graph.plotArea = function (xAxis, yAxis) {
    "use strict";
    var drawnObjects = [];
    
    function addXYLine(xs, ys) {
        var obj = ["xyLine", xs, ys];
        drawnObjects.push(obj);
        return obj;
    }

    function addPoints(xs, ys) {
        var obj = ["points", xs, ys];
        drawnObjects.push(obj);
        return obj;
    }

    function addText(x, y, text) {
        var obj = ["text", x, y, text];
        drawnObjects.push(obj);
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
        
        for (i = 0; i < drawnObjects.length; i += 1) {
            if (drawnObjects[i][0] === "xyLine") {
                xDisplay = xAxis.mapWorldToDisplay(drawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(drawnObjects[i][2]);
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
            
            } else if (drawnObjects[i][0] === "points") {
                xDisplay = xAxis.mapWorldToDisplay(drawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(drawnObjects[i][2]);

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
            
            } else if (drawnObjects[i][0] === "text") {
            
                xDisplay = xAxis.mapWorldToDisplay(drawnObjects[i][1]);
                yDisplay = yAxis.mapWorldToDisplay(drawnObjects[i][2]);
                text = drawnObjects[i][3];
                
                context.fillText(text, xDisplay, yDisplay);
            }            
        } 

        context.restore();
    }

    function remove(obj) {
        var i;

        // this is O(N), but could be rewritten to be O(log(N)) if needed
        for (i = 0; i < drawnObjects.length; i += 1) {
            if (drawnObjects[i] === obj) {
                drawnObjects.splice(i, 1);
            }
        }
    }

    function createSVG(panel) {
        var svg;

        svg = document.createElement('div');
        panel.appendChild(svg);
    }

    return {
        addXYLine : addXYLine,
        addPoints : addPoints,
        addText : addText,
        remove : remove,
        draw : draw,
        createSVG : createSVG
    };
};

