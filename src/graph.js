var graph = {};

graph.linearAxis = function (worldMin, worldMax, displayMin, displayMax) {
    "use strict";
    var worldLength = worldMax - worldMin,
        displayLength = displayMax - displayMin,
        worldToDisplayScale = displayLength / worldLength,
        displayToWorldScale = worldLength / displayLength;
    
    function mapWorldToDisplay(ordinates) {
        var l = ordinates.length,
            i = l, 
            result = [];
        result.length = l; 
        
        while (i > 0) {
            i -= 1;
            result[i] = ((ordinates[i] - worldMin) * worldToDisplayScale 
                    + displayMin);
        }

        return result;
    }

    function mapDisplayToWorld(ordinates) {
        var l = ordinates.length,
            i = l, 
            result = [];
        result.length = l; 
        
        while (i > 0) {
            i -= 1;
            result[i] = ((ordinates[i] - displayMin) / worldToDisplayScale 
                    + worldMin);
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
    var xyLines = [];
    
    function addXYLine(xs, ys) {
        xyLines.push([xs, ys]);
    }

    function draw(context) {
        var i, j, l, xDisplay, yDisplay, drawing, x, y;
        
        // make sure we save and restore the current clipping rectangle
        context.save();
        context.beginPath();
        context.rect(xAxis.displayMin(), yAxis.displayMin(), 
                xAxis.displayLength(), yAxis.displayLength());
        context.clip();
        
        for (i = 0; i < xyLines.length; i += 1) {
            xDisplay = xAxis.mapWorldToDisplay(xyLines[i][0]);
            yDisplay = yAxis.mapWorldToDisplay(xyLines[i][1]);
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
        }

        context.restore();
    }

    return {
        addXYLine : addXYLine,
        draw : draw
    };
};

