
TestCase("LinearAxis", {
    "test mapOrdinates should map points between coordinate systems" : function() {
        var axis = graph.linearAxis(5, 20, 100, 250);
        var world_ordinates = [0, 1, 6.25, 13, 33];

        var screen_ordinates = axis.mapOrdinates(world_ordinates);

        assertEquals([50, 60, 112.5, 180, 380], screen_ordinates);
    }
});

