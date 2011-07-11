TestCase("EulerStep", {
    setUp: function() {
        this.dy = function (y) { return [y[1], -0.3*y[0], 0.7*y[2]]; };
        this.y = [5., 11., 13.];
    },

    "test EulerStep should update by derivative times time" : function() {
        y1 = ode.eulerStep(this.dy, this.y, 0, 0.01);
        assertEquals([5.11, 10.985, 13.091], y1);
    }
});


TestCase("DriftIntegrate", {
    setUp: function() {
        sinon.stub(ode, "eulerStep", function(dy, y, dt) {
            return [3*y[0], y[1]];
        });
    },

    tearDown: function() {
        ode.eulerStep.restore()
    },

    "test integrate should return the results of several eulerSteps" : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.5,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertNotUndefined(result);
        assertEquals([0, 0.5, 1], result.t);
        assertEquals([1, 3, 9], result.y[0]);
        assertEquals([2, 2, 2], result.y[1]);
    }
});


TestCase("JumpIntegrate", {
    "test integrate should handle jump processes" : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 10,
            tMaxStep: 1,
            drift: function () { return [3]; },
            jump: function(y, t) { if (y[0] >= 10) return [y[0]-10]; },
            y0: [ 1 ]
        });

        assertEquals([ 1, 4, 7, 0, 3, 6, 9, 2, 5, 8, 1 ], result.y[0]);
    }
});
