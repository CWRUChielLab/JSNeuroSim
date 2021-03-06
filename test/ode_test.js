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
        var that = this,
            stepsLeft = 100,
            time = 0;

        this.error = function (y, t, dt) {
            return [1e-9, 1e-9];
        };

        sinon.stub(ode, "rk45Step", function(dy, y, t, dt) {
            time += 10;
            stepsLeft -= 1;

            if (stepsLeft < 0) {
                throw Error('Too many steps taken!');
            }

            return { y : [3*y[0], y[1]], delta : that.error(y, t, dt) };
        });

        this.oldDate = Date;
        Date = function () {
            this.getTime = function () {
                return time;
            }
        }
    },

    tearDown: function() {
        ode.rk45Step.restore();
        Date = this.oldDate;
    },

    "test integration result should have map function" : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.5,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        function func (state, t) {
           var i, sum = 0;
           for (i=0; i<state.length; i+=1) {
               sum += state[i];
           }
           return [t,sum];
        };

        assertNotUndefined(result);
        assertFunction(result.map);
        assertEquals([[0, 3], [0.5, 5], [1, 11]], result.map(func));
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
        assertEquals('reached tMax', result.terminationReason);
    },

    "test integrate should report that it reached tMax" : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.5,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertEquals('reached tMax', result.terminationReason);
    },

    "test integrate should set t_f and y_f to the final time and position" 
        : function() {
        
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.5,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertEquals(result.t[result.t.length - 1], result.t_f);
        assertEquals(result.y[0][result.t.length - 1], result.y_f[0]);
        assertEquals(result.y[1][result.t.length - 1], result.y_f[1]);
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
            tMinOutput: 0,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertNotUndefined(result);
        assertTrue(result.t[1] - result.t[0] < 0.1);
        assertTrue(result.t[2] - result.t[1] < 0.1);
        assertEquals('reached tMax', result.terminationReason);
    },

    "test integrate should exit when it encounters an unavoidable NaN" : function() {
        var result;
       
        this.error = function (y, t, dt) {
            return [ 1e-9, NaN ];
        };

        result = ode.integrate({
            tMin: 0.1,
            tMax: 1,
            tMaxStep: 0.5,
            tMinOutput: 0,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertNotUndefined(result);
        assertEquals(1, result.t.length);
        assertEquals(1, result.y[0].length);
        assertEquals('Step size too small', result.terminationReason);
    },

    "test integrate should output steps no closer than min output interval" 
        : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.1,
            tMinOutput: 0.3,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertTrue(result.t[1] - result.t[0] > 0.3);
        assertTrue(result.t[2] - result.t[1] > 0.3);
        assertTrue(result.t[3] - result.t[2] > 0.3);
    },

    "test integrate should stop early if it exceeds the timeout" 
        : function() {
        var result = ode.integrate({
            tMin: 0,
            tMax: 1,
            tMaxStep: 0.1,
            timeout: 50,
            drift: function () {},
            y0: [ 1, 2 ]
        });

        assertEquals(6, result.t.length);
        assertEquals('Timeout', result.terminationReason);
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
