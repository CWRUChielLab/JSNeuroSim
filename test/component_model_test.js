TestCase("ComponentModel", {
    setUp: function () {
        this.model = componentModel.componentModel();

        this.iA1 = this.model.addStateVar("a1", 0.3);
        this.iB = this.model.addStateVar("b", 0.1);

        sinon.stub(ode, "integrate", function () { return "stubbed ode.integrate"; });
    },

    tearDown: function () {
        ode.integrate.restore();
    },

    "test addStatevar should return sequential numbers" : function() {
        assertEquals(this.iA1 + 1, this.iB);
    },
    
    "test statevar numbers should be tracked" : function() {
        assertEquals(2, this.model.numStateVars());
    },

    "test statevar names should be saved" : function() {
        assertEquals("a1", this.model.stateVarName(0));
        assertEquals("b", this.model.stateVarName(1));
    },

    "test initial values vector should be available" : function () {
        assertEquals([ 0.3, 0.1 ], this.model.initialValues());
    },

    "test initial values should be a copy, not the original" : function () {
        var initialValues = this.model.initialValues();
        initialValues[0] = 5;
        assertNotEquals(5, this.model.initialValues()[0]);
    },

    "test drift function should call registered functions with current state" 
        : function () {
        var state = [2.1, 3.1];

        function checkState(state, t) {
            assertEquals(t, 1.3);
            assertEquals([2.1, 3.1], state);
        }

        function a(drift, state, t) {
            checkState(state, t);
            drift[0] = 5;
        };

        function b(drift, state, t) {
            checkState(state, t);
            drift[1] = 7;
        };

        this.model.registerDrift(a);
        this.model.registerDrift(b);

        var drift = this.model.drift(state, 1.3);

        assertEquals([5, 7], drift);
    },

    "test jump function should call registered functions with current state" 
        : function () {
        var state = [2.1, 3.1];

        function a(state, t) {
            assertEquals(t, 1.3);
            assertEquals(2.1, state[0]);
            state[0] = 8.2;
            return true;
        };

        function b(state, t) {
            assertEquals(t, 1.3);
            assertEquals(state[1], 3.1);
            state[1] = 13.1;
            return true;
        };

        this.model.registerJump(a);
        this.model.registerJump(b);

        assertEquals([8.2, 13.1], this.model.jump(state, 1.3));
    },

    "test jump function should return state when one function returns true" 
        : function () {
        var state = [1, 2];

        this.model.registerJump(function () {});
        this.model.registerJump(function () { return true; });
        this.model.registerJump(function () {});

        assertNotUndefined(this.model.jump(state, 3));
    },

    "test jump function should not state when all functions return false" 
        : function () {
        var state = [1, 2];

        this.model.registerJump(function () {});
        this.model.registerJump(function () { return false; });
        this.model.registerJump(function () {});

        assertUndefined(this.model.jump(state, 3));
    },

    "test integrate should wrap ode.integrate with modified options"
        : function () {
        var result = this.model.integrate({
            anOption : 0.859
            });

        assertEquals("stubbed ode.integrate", result);
        assertTrue(ode.integrate.called);
        assertEquals(0.859, ode.integrate.args[0][0].anOption);
        assertEquals(this.model.jump, ode.integrate.args[0][0].jump);
        assertEquals(this.model.drift, ode.integrate.args[0][0].drift);
        assertEquals(this.model.initialValues(), ode.integrate.args[0][0].y0);
    },

    "test integrate should allow initial values to be overridden"
        : function () {
        var result = this.model.integrate({
            y0 : [9.2, 6.1]
            });

        assertEquals([9.2, 6.1], ode.integrate.args[0][0].y0);
    }
});

