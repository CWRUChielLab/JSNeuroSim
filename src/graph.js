var graph = {};

graph.linearAxis = function (worldMin, worldMax, screenMin, screenMax) {
    "use strict";
    var worldLength = worldMax - worldMin,
        screenLength = screenMax - screenMin,
        worldToScreenScale = screenLength/worldLength,
        screenToWorldScale = worldLength/screenLength;
    

    function mapOrdinates(ordinates) {
        var l = ordinates.length,
            i = l, 
            result = new Array(l); 
        
        while (i > 0) {
            i -= 1;
            result[i] = (ordinates[i] - worldMin) * worldToScreenScale + screenMin;
        }

        return result;
    }

    return {
        mapOrdinates : mapOrdinates,
        worldMin : function () { return worldMin; },
        worldMax : function () { return worldMax; },
        worldLength : function () { return worldLength; },
        screenMin : function () { return screenMin; },
        screenMax : function () { return screenMax; },
        screenLength : function () { return screenLength; }
    };
};


graph.plotArea = function (xAxis, yAxis) {
    "use strict";
    var xyLines = [];
    
    function addXYLine(xs, ys) {
        xyLines.push([xs,ys]);
    }

    function draw(context) {
        var i, j, l, xScreen, yScreen, drawing, x, y;
        
        // make sure we save and restore the current clipping rectangle
        context.save();
        context.beginPath();
        context.rect(xAxis.screenMin(), yAxis.screenMin(), 
                xAxis.screenLength(), yAxis.screenLength());
        context.clip();
        
        for (i = 0; i < xyLines.length; i += 1) {
            xScreen = xAxis.mapOrdinates(xyLines[i][0]);
            yScreen = yAxis.mapOrdinates(xyLines[i][1]);
            drawing = false;

            l = xScreen.length;
            j = l;
            
            context.beginPath();
            
            
            while (j > 0) {
                j -= 1;
                x = xScreen[j];
                y = yScreen[j];

                if (isFinite(x) && isFinite(y)) {
                    if (drawing) {
                        context.lineTo(x, y); 
                    }
                    else {
                        context.moveTo(x, y); 
                        drawing = true;
                    }
                }
                else {
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

