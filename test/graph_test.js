
TestCase("LinearAxis", {
    setUp : function () {
        this.axis = graph.linearAxis(5, 20, 100, 250); 
        this.axisFlipped = graph.linearAxis(5, 20, 450, 300); 
        this.worldOrdinates = [0, 1, 6.25, 13, 33];
        this.displayOrdinates = [50, 60, 112.5, 180, 380];
        this.displayOrdinatesFlipped = [500, 490, 437.5, 370, 170];
    },

    "test mapWorldToDisplay should map points between coordinate systems" : 
            function() {
        var result = this.axis.mapWorldToDisplay(this.worldOrdinates);

        assertEquals(this.displayOrdinates, result);
    },

    "test mapWorldToDisplay should work for single points" : 
            function() {
        var result = this.axis.mapWorldToDisplay(this.worldOrdinates[0]);

        assertEquals(this.displayOrdinates[0], result);
    },

    "test mapWorldToDisplay should handle flipped coordinate systems" : 
            function() {
        var result = this.axisFlipped.mapWorldToDisplay(this.worldOrdinates);

        assertEquals(this.displayOrdinatesFlipped, result);
    },

    "test mapDisplayToWorld should be the inverse of mapWorldToDisplay" : 
            function() {
        var result = this.axis.mapDisplayToWorld(this.displayOrdinates);

        assertEquals(this.worldOrdinates, result);
    },

    "test mapDisplayToWorld should work for single points" : 
            function() {
        var result = this.axis.mapDisplayToWorld(this.displayOrdinates[0]);

        assertEquals(this.worldOrdinates[0], result);
    },

    "test mapDisplayToWorld should work for flipped coordinates" : 
            function() {
        var result = this.axisFlipped.mapDisplayToWorld(
                this.displayOrdinatesFlipped
                );

        assertEquals(this.worldOrdinates, result);
    },

    "test isInDisplayRange should check if coordinate falls within axis" : 
            function() {
        assertTrue(this.axis.isInDisplayRange(110));
        assertFalse(this.axis.isInDisplayRange(310));
        assertFalse(this.axis.isInDisplayRange(99));

        assertTrue(this.axisFlipped.isInDisplayRange(310));
        assertFalse(this.axisFlipped.isInDisplayRange(299));
        assertFalse(this.axisFlipped.isInDisplayRange(461));
    }
});


TestCase("PlotArea", {
    setUp : function () {
        var that = this;

        this.panel = document.createElement('div');

        this.xAxis = graph.linearAxis(1, 10, 20, 110);
        this.yAxis = graph.linearAxis(3, 9, 6, 18);
        this.plotArea = graph.plotArea(this.xAxis, this.yAxis, this.panel);

        this.context = createStubbedObj(['save', 'restore', 'beginPath', 'rect', 
            'moveTo', 'lineTo', 'stroke', 'clip', 'fillText']);

        this.plotSetup = [
            ['save', []],
            ['beginPath', []],
            ['rect', [this.xAxis.displayMin(), this.yAxis.displayMin(), 
                this.xAxis.displayLength(), this.yAxis.displayLength()]],
            ['clip', []]
        ];
        this.plotCleanup = [
            ['restore', []]
        ];

        // get the drawing calls without the unchanging setup and cleanup calls
        this.drawingCalls = function () {
            var allCalls = this.context.getCalls();
            
            return allCalls.slice(this.plotSetup.length,
                allCalls.length - this.plotCleanup.length);
        };

        // get the drawing calls without the unchanging setup and cleanup calls
        this.getDrawingElements = function () {
            return Array.prototype.slice.apply(
                    this.panel.childNodes[0].childNodes, 
                    [0]
            );
        };
    },

    "test should create an svg" : function() {
        assertEquals(1, this.panel.childNodes.length);
        assertEquals('SVG', this.panel.childNodes[0].tagName);
    },

    "test should add xyLine to svg" : function() {
        var x = [1, 13, 5],
            y = [7, 11, -3],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            elements;

        this.plotArea.addXYLine(x, y);
        elements = this.getDrawingElements();

        assertEquals(1, elements.length);
        assertEquals('POLYLINE', elements[0].tagName);
        assertEquals('none', elements[0].fill);
        assertEquals('black', elements[0].stroke);
        assertEquals(xScreen[0] + ',' + yScreen[0] + ' ' + 
            xScreen[1] + ',' + yScreen[1] + ' ' +
            xScreen[2] + ',' + yScreen[2] + ' ',
            elements[0].points);
    },

    "test svg line should skip NaN and infinity" : function() {
        var x = [1,   13,  4, Infinity,         5, 13, 6,       13, 12, NaN ],
            y = [NaN, 11, 12,       -3, -Infinity, 12, 3, Infinity,  8,   7 ],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            elements;

        this.plotArea.addXYLine(x, y);
        elements = this.getDrawingElements();

        assertEquals(3, elements.length);
        assertEquals(xScreen[1] + ',' + yScreen[1] + ' ' + 
            xScreen[2] + ',' + yScreen[2] + ' ',
            elements[0].points);
        assertEquals(xScreen[5] + ',' + yScreen[5] + ' ' + 
            xScreen[6] + ',' + yScreen[6] + ' ',
            elements[1].points);
        assertEquals(xScreen[8] + ',' + yScreen[8] + ' ',
            elements[2].points);
    },

    "test addText should add text to the svg" : function() {
        var x = 1,
            y = 7,
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            elements;

        this.plotArea.addText(x, y, "abc");
        elements = this.getDrawingElements();

        assertEquals(1, elements.length);
        assertEquals('TEXT', elements[0].tagName);
        assertEquals('' + xScreen, elements[0].x);
        assertEquals('' + yScreen, elements[0].y);
        assertEquals("abc", elements[0].innerHTML);
    },

    "test addPoints should add crosshairs to the svg" : function() {
        var x = [1, 2.1, Infinity, 3.4, 6.2],
            y = [7, 6.3, 8.1, NaN, 3.3],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            delta = 10,
            elements,
            i, validIndexes, xc, yc, line1, line2;

        this.plotArea.addPoints(x, y);
        elements = this.getDrawingElements();

        validIndexes = [0,1,4]; // should skip NaN and Infinity

        assertEquals(2 * validIndexes.length, elements.length);
        
        for (i = 0; i < validIndexes.length; ++i) {
            xc = xScreen[validIndexes[i]];
            yc = yScreen[validIndexes[i]];

            line1 = elements[2 * i];
            assertEquals('LINE', line1.tagName);
            assertEquals('none', line1.fill);
            assertEquals('black', line1.stroke);
            assertEquals(xc, line1.x1);
            assertEquals(yc - delta, line1.y1);
            assertEquals(xc, line1.x2);
            assertEquals(yc + delta, line1.y2);

            line2 = elements[2 * i + 1];
            assertEquals('LINE', line2.tagName);
            assertEquals('none', line2.fill);
            assertEquals('black', line2.stroke);
            assertEquals(xc-delta, line2.x1);
            assertEquals(yc, line2.y1);
            assertEquals(xc+delta, line2.x2);
            assertEquals(yc, line2.y2);
        }
    },

    "test should have proper setup" : function() {
        this.plotArea.draw(this.context);
        assertEquals(this.plotSetup, 
            this.context.getCalls().slice(0, this.plotSetup.length));
    },

    "test should have proper cleanup" : function() {
        this.plotArea.draw(this.context);
        assertEquals(this.plotCleanup, 
            this.context.getCalls().slice(this.plotSetup.length));
    },

    "test should render xyLine to canvas" : function() {
        var x = [1, 13, 5],
            y = [7, 11, -3],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y);

        this.plotArea.addXYLine(x, y);
        this.plotArea.draw(this.context);

        assertEquals(
            [
                ['beginPath', []],
                ['moveTo', [xScreen[2], yScreen[2]]],
                ['lineTo', [xScreen[1], yScreen[1]]],
                ['lineTo', [xScreen[0], yScreen[0]]],
                ['stroke', []]
            ],
            this.drawingCalls()
        );
    },

    "test line should skip NaN and infinity" : function() {
        var x = [1,   13,  4, Infinity,         5, 13, 6,       13, 12, NaN ],
            y = [NaN, 11, 12,       -3, -Infinity, 12, 3, Infinity,  8,   7 ],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y);

        this.plotArea.addXYLine(x, y);
        this.plotArea.draw(this.context);

        assertEquals(
            [
                ['beginPath', []],
                ['moveTo', [xScreen[8], yScreen[8]]],
                ['moveTo', [xScreen[6], yScreen[6]]],
                ['lineTo', [xScreen[5], yScreen[5]]],
                ['moveTo', [xScreen[2], yScreen[2]]],
                ['lineTo', [xScreen[1], yScreen[1]]],
                ['stroke', []],
            ],
            this.drawingCalls()
        );
    },

    "test addText should add text to the graph" : function() {
        var x = 1,
            y = 7,
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y);

        this.plotArea.addText(x, y, "abc");
        this.plotArea.draw(this.context);

        assertEquals([['fillText', ["abc", xScreen, yScreen]]], 
            this.drawingCalls());
    },

    "test addPoints should add crosshairs to the graph" : function() {
        var x = [1, 2.1, Infinity, 3.4, 6.2],
            y = [7, 6.3, 8.1, NaN, 3.3],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            delta = Math.min(this.xAxis.displayLength(),
                this.yAxis.displayLength())/20;

        this.plotArea.addPoints(x, y);
        this.plotArea.draw(this.context);

        assertEquals(
            [
                ['beginPath', []],
                ['moveTo', [xScreen[4]-delta, yScreen[4]]],
                ['lineTo', [xScreen[4]+delta, yScreen[4]]],
                ['moveTo', [xScreen[4], yScreen[4]-delta]],
                ['lineTo', [xScreen[4], yScreen[4]+delta]],
                // should skip infinity and NaN points
                ['moveTo', [xScreen[1]-delta, yScreen[1]]],
                ['lineTo', [xScreen[1]+delta, yScreen[1]]],
                ['moveTo', [xScreen[1], yScreen[1]-delta]],
                ['lineTo', [xScreen[1], yScreen[1]+delta]],
                ['moveTo', [xScreen[0]-delta, yScreen[0]]],
                ['lineTo', [xScreen[0]+delta, yScreen[0]]],
                ['moveTo', [xScreen[0], yScreen[0]-delta]],
                ['lineTo', [xScreen[0], yScreen[0]+delta]],
                ['stroke', []],
            ],
            this.drawingCalls()
        );
    },

    "test remove should get rid of a line" : function() {
        var x = [1, 13, 5], y = [7, 11, -3], line;

        line = this.plotArea.addXYLine(x, y);
        this.plotArea.remove(line);
        this.plotArea.draw(this.context);

        assertEquals([], this.drawingCalls());
    },
    
    "test remove should only remove the requested object" : function() {
        var x = [1, 13, 5, 6],
            y = [7, 11, -3, 4],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            removedText;

        this.plotArea.addText(x[0], y[0], "a");
        this.plotArea.addText(x[1], y[1], "b");
        removedText = this.plotArea.addText(x[2], y[2], "c");
        this.plotArea.addText(x[3], y[3], "d");

        this.plotArea.remove(removedText);
        this.plotArea.draw(this.context);

        assertEquals(
                [
                    ['fillText', ["a", xScreen[0], yScreen[0]]],
                    ['fillText', ["b", xScreen[1], yScreen[1]]],
                    ['fillText', ["d", xScreen[3], yScreen[3]]],
                ], 
            this.drawingCalls()
        );
    },

});
