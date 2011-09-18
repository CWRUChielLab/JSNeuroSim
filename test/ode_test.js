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


TestCase("RK4Step", {
    setUp: function() {
        this.dy = function (y) { return [y[1], -0.25*y[0], 0.75*y[2]]; };
        this.y = [5., 11., 13.];
    },

    "test rk4Step should update by a 4th order Runge-Kutta step" : function() {
        y1 = ode.rk4Step(this.dy, this.y, 0, 0.5);
        // expected numbers calculated in python
        assertClose(10.28727214, y1[0]);
        assertClose(10.03955078, y1[1]);
        assertClose(18.91403198, y1[2]);
    }
});


TestCase("RK45Step", {
    setUp: function() {
        this.dy = function (y) { return [y[1], -0.25*y[0], 0.75*y[2]]; };
        this.y = [5., 11., 13.];
    },

    "test rk45Step should update by a 5th order Runge-Kutta step" : function() {
        var result = ode.rk45Step(this.dy, this.y, 0, 0.5);
        // expected numbers calculated in python
        assertClose(10.28744914, result.y[0]);
        assertClose(10.03952596, result.y[1]);
        assertClose(18.91489561, result.y[2]);
    },

    "test rk45Step should return expected deltas" : function() {
        var result = ode.rk45Step(this.dy, this.y, 0, 0.5);
        // expected numbers calculated in python
        assertClose(-1.77073161e-5, result.delta[0]);
        assertClose(1.09430949e-6, result.delta[1]);
        assertClose(-6.67429090e-5, result.delta[2]);
    }
});


TestCase("DriftIntegrate", {
    setUp: function() {
        var that = this;
        this.error = function (y, t, dt) {
            return [1e-9, 1e-9];
        };

        sinon.stub(ode, "rk45Step", function(dy, y, t, dt) {
            return { y : [3*y[0], y[1]], delta : that.error(y, t, dt) };
        });
    },

    tearDown: function() {
        ode.rk45Step.restore()
    },

    "test integrate should return the results of several rk4Steps" : function() {
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
    },

    "test integrate should take smaller steps if delta is large" : function() {
        var result;
       
        this.error = function (y, t, dt) {
            if (dt >= 0.1) {
                return [1, 1];
            } else {
                return [1e-9, 1e-9];
            }
        };

        result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.5,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertNotUndefined(result);
        console.log(result.t);
        assertTrue(result.t[1] - result.t[0] < 0.1);
        assertTrue(result.t[2] - result.t[1] < 0.1);
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

        var expected = [ 1, 4, 7, 0, 3, 6, 9, 2, 5, 8, 1 ];  

        for (i = 0; i < expected.length; ++i) {
            assertClose(expected[i], result.y[0][i], 1e-9, 1e-9);
        }
    }
});


function EarlyExit(message) {
    this.name = "EarlyExit";
    this.message = message;
}
EarlyExit.prototype = Error.prototype;

TestCase("IntegrateDefaultParameters", {
    setUp: function() {
        sinon.stub(ode, "rk45Step", function(drift, y, t, dt) {
            assertEquals(4, dt);
            throw new EarlyExit("Once is enough");
        });
    },

    tearDown: function() {
        ode.rk45Step.restore()
    },

    "test integrate should default to a time step of 1/1024th of the total time" : function() {
        assertException(function () {
                ode.integrate({
                    tMin: 1000,
                    tMax: 5096,
                    drift: function () {},
                    y0: [ 1 ]
                });
            },
            "EarlyExit"
        );
    }
});
