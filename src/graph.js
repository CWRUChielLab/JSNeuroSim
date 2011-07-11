var graph = {};

graph.linearAxis = function (worldMin, worldMax, screenMin, screenMax) {
    var worldLength = worldMax - worldMin,
        screenLength = screenMax - screenMin,
        worldToScreenScale = screenLength/worldLength,
        screenToWorldScale = worldLength/screenLength;

    function mapOrdinates(ordinates) {
        var l = ordinates.length,
            i = l, 
            result = new Array(l); 
        
        while (i > 0) {
            --i;
            result[i] = (ordinates[i] - worldMin) * worldToScreenScale + screenMin;
        }

        return result;
    }

    return {
        mapOrdinates : mapOrdinates
    };
};
