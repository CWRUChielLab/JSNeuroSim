
TestCase("LinearAxis", {
    "test mapOrdinates should map points between coordinate systems" : function() {
        var axis = graph.linearAxis(5, 20, 100, 250);
        var world_ordinates = [0, 1, 6.25, 13, 33];

        var screen_ordinates = axis.mapOrdinates(world_ordinates);

        assertEquals([50, 60, 112.5, 180, 380], screen_ordinates);
    },

    "test world and screen limits should be accessible" : function() {
        var axis = graph.linearAxis(-4.2, -1.7, -8.4, 7.1);

        assertEquals(-4.2, axis.worldMin());
        assertEquals(-1.7, axis.worldMax());
        assertEquals(2.5, axis.worldLength());
        assertEquals(-8.4, axis.screenMin());
        assertEquals(7.1, axis.screenMax());
        assertEquals(15.5, axis.screenLength());
    }
});


TestCase("PlotArea", {
    "test should render xyLine to canvas" : function() {
        var xAxis = graph.linearAxis(1, 10, 20, 110),
            yAxis = graph.linearAxis(3, 9, 6, 18),
            plotArea = graph.plotArea(xAxis, yAxis),
            x = [1, 13, 5],
            y = [7, 11, -3],
            xScreen = xAxis.mapOrdinates(x);
            yScreen = yAxis.mapOrdinates(y);

        var context = createStubbedObj(['save', 'restore', 'beginPath', 'rect', 
            'moveTo', 'lineTo', 'stroke', 'clip']);

        plotArea.addXYLine(x, y);
        plotArea.draw(context);

        assertEquals(
            [
                ['save', []],
                ['beginPath', []],
                ['rect', [xAxis.screenMin(), yAxis.screenMin(), 
                    xAxis.screenLength(), yAxis.screenLength()]],
                ['clip', []],
                ['beginPath', []],
                ['moveTo', [xScreen[2], yScreen[2]]],
                ['lineTo', [xScreen[1], yScreen[1]]],
                ['lineTo', [xScreen[0], yScreen[0]]],
                ['stroke', []],
                ['restore', []]
            ],
            context.getCalls());
    },

    "test should skip NaN and infinity" : function() {
        var xAxis = graph.linearAxis(1, 10, 20, 110),
            yAxis = graph.linearAxis(3, 9, 6, 18),
            plotArea = graph.plotArea(xAxis, yAxis),
            x = [1,   13,  4, Infinity,         5, 13, 6,       13, 12, NaN ],
            y = [NaN, 11, 12,       -3, -Infinity, 12, 3, Infinity,  8,   7 ],
            xScreen = xAxis.mapOrdinates(x);
            yScreen = yAxis.mapOrdinates(y);

        var context = createStubbedObj(['save', 'restore', 'beginPath', 'rect', 
            'moveTo', 'lineTo', 'stroke', 'clip']);

        plotArea.addXYLine(x, y);
        plotArea.draw(context);

        assertEquals(
            [
                ['save', []],
                ['beginPath', []],
                ['rect', [xAxis.screenMin(), yAxis.screenMin(), 
                    xAxis.screenLength(), yAxis.screenLength()]],
                ['clip', []],
                ['beginPath', []],
                ['moveTo', [xScreen[8], yScreen[8]]],
                ['moveTo', [xScreen[6], yScreen[6]]],
                ['lineTo', [xScreen[5], yScreen[5]]],
                ['moveTo', [xScreen[2], yScreen[2]]],
                ['lineTo', [xScreen[1], yScreen[1]]],
                ['stroke', []],
                ['restore', []]
            ],
            context.getCalls());
    }
});
