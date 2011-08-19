
TestCase("LinearAxis", {
    setUp : function () {
        this.axis = graph.linearAxis(5, 20, 100, 250); 
        this.axisFlipped = graph.linearAxis(5, 20, 450, 300); 
        this.worldOrdinates = [0, 1, 6.25, 13, 33];
    },

    "test mapWorldToDisplay should map points between coordinate systems" : 
            function() {
        var displayOrdinates = 
            this.axis.mapWorldToDisplay(this.worldOrdinates);

        assertEquals([50, 60, 112.5, 180, 380], displayOrdinates);
    },

    "test mapWorldToDisplay should handle flipped coordinate systems" : 
            function() {
        var displayOrdinates = 
            this.axisFlipped.mapWorldToDisplay(this.worldOrdinates);

        assertEquals([500, 490, 437.5, 370, 170], displayOrdinates);
    },

    "test mapDisplayToWorld should be the inverse of mapWorldToDisplay" : 
            function() {
        var displayOrdinates = 
                this.axis.mapWorldToDisplay(this.worldOrdinates),
            newWorldOrdinates = 
                this.axis.mapDisplayToWorld(displayOrdinates),
            displayOrdinatesFlipped = 
                this.axisFlipped.mapWorldToDisplay(this.worldOrdinates),
            newWorldOrdinatesFlipped = 
                this.axisFlipped.mapDisplayToWorld(displayOrdinatesFlipped);

        assertEquals(this.worldOrdinates, newWorldOrdinates);
        assertEquals(this.worldOrdinates, newWorldOrdinatesFlipped);
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

        this.xAxis = graph.linearAxis(1, 10, 20, 110);
        this.yAxis = graph.linearAxis(3, 9, 6, 18);
        this.plotArea = graph.plotArea(this.xAxis, this.yAxis);

        this.context = createStubbedObj(['save', 'restore', 'beginPath', 'rect', 
            'moveTo', 'lineTo', 'stroke', 'clip']);

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
    }
});
