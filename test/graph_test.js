
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
        this.panel = document.createElementNS(
            "http://www.w3.org/2000/svg",
            'svg:svg'
        );

        this.xAxis = graph.linearAxis(1, 10, 20, 110);
        this.yAxis = graph.linearAxis(3, 9, 6, 18);
        this.plotArea = graph.plotArea(this.xAxis, this.yAxis, this.panel);

        this.context = createStubbedObj(['save', 'restore', 'beginPath', 
            'rect', 'moveTo', 'lineTo', 'stroke', 'clip', 'fillText']);

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
                    this.panel.childNodes, 
                    [0]
            );
        };
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
        assertEquals('polyline', elements[0].tagName);
        assertEquals('none', elements[0].getAttribute('fill'));
        assertEquals('black', elements[0].getAttribute('stroke'));
        assertEquals(3, elements[0].points.numberOfItems);
        assertEquals(xScreen[0], elements[0].points.getItem(0).x);
        assertEquals(yScreen[0], elements[0].points.getItem(0).y);
        assertEquals(xScreen[1], elements[0].points.getItem(1).x);
        assertEquals(yScreen[1], elements[0].points.getItem(1).y);
        assertEquals(xScreen[2], elements[0].points.getItem(2).x);
        assertEquals(yScreen[2], elements[0].points.getItem(2).y);
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
        assertEquals(xScreen[1], elements[0].points.getItem(0).x);
        assertEquals(yScreen[1], elements[0].points.getItem(0).y);
        assertEquals(xScreen[2], elements[0].points.getItem(1).x);
        assertEquals(yScreen[2], elements[0].points.getItem(1).y);

        assertEquals(xScreen[5], elements[1].points.getItem(0).x);
        assertEquals(yScreen[5], elements[1].points.getItem(0).y);
        assertEquals(xScreen[6], elements[1].points.getItem(1).x);
        assertEquals(yScreen[6], elements[1].points.getItem(1).y);

        assertEquals(xScreen[8], elements[2].points.getItem(0).x);
        assertEquals(yScreen[8], elements[2].points.getItem(0).y);
    },

    "test addText should add text to the svg" : function() {
        var x = 1,
            y = 7,
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            elements;

        this.plotArea.addText(x, y, 'abc');
        elements = this.getDrawingElements();

        assertEquals(1, elements.length);
        assertEquals('text', elements[0].tagName);
        assertEquals('' + xScreen, elements[0].x.animVal.getItem(0).value);
        assertEquals('' + yScreen, elements[0].y.animVal.getItem(0).value);
        assertEquals('abc', elements[0].childNodes[0].nodeValue);
    },

    "test addText should accept optional font size" : function() {
        var x = 1, y = 7, elements;

        this.plotArea.addText(x, y, "abc", { fontSize: 16 });
        elements = this.getDrawingElements();

        assertEquals('16', elements[0].getAttribute('font-size'));
    },

    "test addText should accept optional alignment strings" : function() {
        var x = 1, y = 7, elements;

        this.plotArea.addText(x, y, "abc", 
                { hAlign: 'end', vAlign: 'top' });
        elements = this.getDrawingElements();

        assertEquals('end', elements[0].getAttribute('text-anchor'));
        assertEquals('top', elements[0].getAttribute('dominant-baseline'));
    },

    "test addText should accept optional offset" : function() {
        var x = 1,
            y = 7,
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            elements;

        this.plotArea.addText(x, y, 'abc', { offset: [5, 3] });
        elements = this.getDrawingElements();

        assertEquals('' + (xScreen + 5), 
                elements[0].x.animVal.getItem(0).value);
        assertEquals('' + (yScreen + 3), 
                elements[0].y.animVal.getItem(0).value);
    },

    "test addPoints should add crosshairs to the svg" : function() {
        var x = [1, 2.1, Infinity, 3.4, 6.2],
            y = [7, 6.3, 8.1, NaN, 3.3],
            xScreen = this.xAxis.mapWorldToDisplay(x),
            yScreen = this.yAxis.mapWorldToDisplay(y),
            delta = 5,
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
            assertEquals('line', line1.tagName);
            assertEquals('none', line1.getAttribute('fill'));
            assertEquals('black', line1.getAttribute('stroke'));
            assertClose(xc, line1.x1.animVal.value, 1e-4);
            assertClose(yc - delta, line1.y1.animVal.value, 1e-4);
            assertClose(xc, line1.x2.animVal.value, 1e-4);
            assertClose(yc + delta, line1.y2.animVal.value, 1e-4);

            line2 = elements[2 * i + 1];
            assertEquals('line', line2.tagName);
            assertEquals('none', line2.getAttribute('fill'));
            assertEquals('black', line2.getAttribute('stroke'));
            assertClose(xc - delta, line2.x1.animVal.value, 1e-4);
            assertClose(yc, line2.y1.animVal.value, 1e-4);
            assertClose(xc + delta, line2.x2.animVal.value, 1e-4);
            assertClose(yc, line2.y2.animVal.value, 1e-4);
        }
    },

    "test remove should get rid of lines" : function() {
        var line, element,
            x = [1,   13,  4, Infinity,         5, 13, 6,       13, 12, NaN ],
            y = [NaN, 11, 12,       -3, -Infinity, 12, 3, Infinity,  8,   7 ];

        line = this.plotArea.addXYLine(x, y);
        this.plotArea.remove(line);
        elements = this.getDrawingElements();

        assertEquals(0, elements.length);
    },

    "test remove should only remove the requested object(s)" : function() {
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

        elements = this.getDrawingElements();

        assertEquals(3, elements.length);
        assertEquals('a', elements[0].childNodes[0].nodeValue);
        assertEquals('b', elements[1].childNodes[0].nodeValue);
        assertEquals('d', elements[2].childNodes[0].nodeValue);
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


TestCase("Graph", {
    setUp: function () {
        this.xs = [1, 13, 5, 6];
        this.ys = [7, 11, -3, 4];
        this.width = 123;
        this.height = 456;
        this.panel = document.createElement("div");

        this.oldPlotArea = graph.plotArea;
        graph.plotArea = function () {
            return createStubbedObj(['addXYLine', 'addText', 'addPoints',
                'remove']);
        }

        this.graph = graph.graph(this.panel, this.width, this.height, 
            this.xs, this.ys, { xUnits: 'as', yUnits: 'bs' });
    },

    tearDown: function () {
        graph.plotArea = this.oldPlotArea;
    },

    "test should create an svg inside a div" : function() {
        assertEquals(1, this.panel.childNodes.length);
        assertEquals('DIV', this.panel.childNodes[0].tagName);
        assertEquals(1, this.panel.childNodes[0].childNodes.length);
        assertEquals('svg:svg', this.panel.childNodes[0].childNodes[0].tagName);
    },

    "test should use width and height of svg" : function() {
        var svg = this.panel.childNodes[0].childNodes[0];

        assertEquals(this.width, svg.getAttribute('width'));
        assertEquals(this.height, svg.getAttribute('height'));
        assertEquals('0 0 ' + this.width + ' ' + this.height, 
                svg.getAttribute('viewBox'));
    },

    "test should expose axes" : function() {
        assertNotUndefined(this.graph.xAxis && 
            this.graph.xAxis.mapWorldToDisplay);
        assertNotUndefined(this.graph.yAxis && 
            this.graph.yAxis.mapWorldToDisplay);
        assertFalse(this.graph.xAxis === this.graph.yAxis);
    },

    "test should expose plotArea" : function() {
        assertNotUndefined(this.graph.plotArea);
        assertNotUndefined(this.graph.plotArea.addXYLine);
    },

    "test world xAxis should have a 5% margin" : function() {
        assertClose(0.4, this.graph.xAxis.worldMin(), 1e-4);
        assertClose(13.6, this.graph.xAxis.worldMax(), 1e-4);
    },

    "test world yAxis should have a 5% margin" : function() {
        assertClose(-3.7, this.graph.yAxis.worldMin(), 1e-4);
        assertClose(11.7, this.graph.yAxis.worldMax(), 1e-4);
    },

    "test world xAxis should always have a non-zero length" : function() {
        var graph1 = graph.graph(this.panel, this.width, this.height, 
            [1, 1], [0,1]),
            graph2 = graph.graph(this.panel, this.width, this.height, 
            [0, 0], [0,1]);
        assertNotEquals(graph1.xAxis.worldMin(), graph1.xAxis.worldMax());
        assertNotEquals(graph2.xAxis.worldMin(), graph2.xAxis.worldMax());
    },

    "test world yAxis should always have a non-zero length" : function() {
        var graph1 = graph.graph(this.panel, this.width, this.height, 
            [0, 1], [1,1]),
            graph2 = graph.graph(this.panel, this.width, this.height, 
            [0, 1], [0,0]);
        assertNotEquals(graph1.yAxis.worldMin(), graph1.yAxis.worldMax());
        assertNotEquals(graph2.yAxis.worldMin(), graph2.yAxis.worldMax());
    },

    "test display xAxis should have a 35 px, 5 px margin" : function() {
        assertClose(35, this.graph.xAxis.displayMin(), 1e-4);
        assertClose(this.width - 10, this.graph.xAxis.displayMax(), 1e-4);
    },

    "test display yAxis should be flipped and have a 10 px, 20 px margin" : 
            function() {
        assertClose(this.height - 20, this.graph.yAxis.displayMin(), 1e-4);
        assertClose(10, this.graph.yAxis.displayMax(), 1e-4);
    },

    "test should plot XYLine for data" : function() {
        assertTrue(
            this.graph.plotArea.hasCall('addXYLine', [this.xs, this.ys]));
    },

    "test should plot Y axis range" : function() {
        var options = { hAlign: 'end', vAlign: 'middle', fontSize: 11, 
            offset: [-4, 0] };

        assertTrue(this.graph.plotArea.hasCall('addText', 
            [1, 11, '11.00', options]));
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [1, -3, '-3.00', options]));
    },

    simulateMouseEvent: function (type, x, y) {
        var svg, screenX, screenY, clientX, clientY, svgRect, evt;
        svg = this.panel.childNodes[0].childNodes[0];
        svgRect = svg.getBoundingClientRect();
        clientX = x + svgRect.left;
        clientY = y + svgRect.top;
        screenX = clientX + window.screenX;
        screenY = clientX + window.screenY;

        evt = document.createEvent("MouseEvent");
        evt.initMouseEvent(type, true, true, window, 0, screenX, screenY,
                clientX, clientY, false, false, false, false, 0, svg); 
        svg.dispatchEvent(evt);

        evt = document.createEvent("MouseEvent");
        evt.initMouseEvent(type, true, true, window, 0, screenX, screenY,
                clientX, clientY, false, false, false, false, 0, window); 
        window.dispatchEvent(evt);
    },

    "test clicking on the graph should add crosshairs at that point" : 
        function () {
        var xDisplay = [70, 70], 
            yDisplay = [50, 50],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay);

        this.simulateMouseEvent("mousedown", xDisplay[0], yDisplay[0]);        
        assertTrue(this.graph.plotArea.hasCall('addPoints', [x, y])); 
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [x[1], y[1], '(' + x[1].toFixed(2) + ' as, '
            + y[1].toFixed(2) + ' bs)', 
            {hAlign: 'start', fontSize: 11, offset: [4, -2]} ])); 
    },

    "test clicking and dragging should create a measuring bar" : function () {
        var xDisplay = [70, 80], 
            yDisplay = [50, 42],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay);

        this.simulateMouseEvent("mousedown", xDisplay[0], yDisplay[0]);        
        this.simulateMouseEvent("mousemove", xDisplay[1], yDisplay[1]);        
        assertTrue(this.graph.plotArea.hasCall('addPoints', [x, y])); 
        assertTrue(this.graph.plotArea.hasCall('addXYLine', 
            [[x[0], x[0], x[1]], [y[0], y[1], y[1]]])); 
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [x[1], y[1], '(' + x[1].toFixed(2) + ' as, ' 
            + y[1].toFixed(2) + ' bs)', 
            {hAlign: 'start', fontSize: 11, offset: [4, -2]} ])); 
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [x[1], y[1], 
            '\u0394(' + (x[1] - x[0]).toFixed(2) + ' as, ' 
            + (y[1] - y[0]).toFixed(2) + ' bs)', 
            {hAlign: 'start', vAlign: 'text-before-edge', 
                fontSize: 11, offset: [4, 0]} ])); 
    },

    "test clicking and dragging left should flip the text" : function () {
        var xDisplay = [70, 60], 
            yDisplay = [50, 42],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay);

        this.simulateMouseEvent("mousedown", xDisplay[0], yDisplay[0]);        
        this.simulateMouseEvent("mousemove", xDisplay[1], yDisplay[1]);        
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [x[1], y[1], '(' + x[1].toFixed(2) + ' as, ' 
            + y[1].toFixed(2) + ' bs)', 
            {hAlign: 'end', fontSize: 11, offset: [-4, -2]} ])); 
        assertTrue(this.graph.plotArea.hasCall('addText', 
            [x[1], y[1], 
            '\u0394(' + (x[1] - x[0]).toFixed(2) + ' as, ' 
            + (y[1] - y[0]).toFixed(2) + ' bs)', 
            {hAlign: 'end', vAlign: 'text-before-edge', 
                fontSize: 11, offset: [-4, 0]} ])); 
    },

    "test cursor should remain after end of click" : function () {
        var xDisplay = [70, 60, 23], 
            yDisplay = [50, 42, 17],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay),
            oldAddPoints;

        this.simulateMouseEvent("mousedown", xDisplay[0], yDisplay[0]);        
        this.simulateMouseEvent("mousemove", xDisplay[1], yDisplay[1]);        
        this.simulateMouseEvent("mouseup", xDisplay[2], yDisplay[2]);        
        oldAddPoints = this.graph.plotArea.findCall('addPoints', 
            [[x[0], x[2]], [y[0], y[2]]]);
        assertFalse(this.graph.plotArea.hasCall('remove', [oldAddPoints]));
    },

    "test mouse move without a mouse down should not create a cursor" 
        : function () {
        var xDisplay = [70, 60, 23], 
            yDisplay = [50, 42, 17],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay);

        this.simulateMouseEvent("mousemove", xDisplay[0], yDisplay[0]);        
        this.simulateMouseEvent("mousemove", xDisplay[1], yDisplay[1]);        
        assertFalse(this.graph.plotArea.hasCall('addPoints')); 
    },

    "test clicking again should remove old cursors" : function () {
        var xDisplay = [70, 80, 88, 33], 
            yDisplay = [50, 42, 17, 82],
            x = this.graph.xAxis.mapDisplayToWorld(xDisplay),
            y = this.graph.yAxis.mapDisplayToWorld(yDisplay),
            oldAddPoints, oldPositionText, oldLengthText;

        this.simulateMouseEvent("mousedown", xDisplay[0], yDisplay[0]);        
        this.simulateMouseEvent("mousemove", xDisplay[1], yDisplay[1]);        
        this.simulateMouseEvent("mouseup", xDisplay[2], yDisplay[2]);        
        this.simulateMouseEvent("mousedown", xDisplay[3], yDisplay[3]);        
        oldAddPoints = this.graph.plotArea.findCall('addPoints', 
            [[x[0], x[2]], [y[0], y[2]]]); 
        assertTrue(this.graph.plotArea.hasCall('remove', [oldAddPoints])); 
        oldPositionText = this.graph.plotArea.findCall('addText', 
            [x[2], y[2], '(' + x[2].toFixed(2) + ' as, ' 
            + y[2].toFixed(2) + ' bs)', 
            {hAlign: 'start', fontSize: 11, offset: [4, -2]} ]); 
        assertTrue(this.graph.plotArea.hasCall('remove', [oldPositionText])); 
        oldLengthText = this.graph.plotArea.findCall('addText', 
            [x[2], y[2], 
            '\u0394(' + (x[2] - x[0]).toFixed(2) + ' as, ' 
            + (y[2] - y[0]).toFixed(2) + ' bs)', 
            {hAlign: 'start', vAlign: 'text-before-edge', fontSize: 11, 
                offset: [4, 0]} ]); 
        assertTrue(this.graph.plotArea.hasCall('remove', [oldLengthText])); 
    }
});
