TestCase("PassiveMembrane", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");
        
        this.passiveMembrane = electrophys.passiveMembrane(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3 });
        this.drift = this.model.registerDrift.args[0][0];
    },

    "test should have one state var" : function () {
        assertEquals(1, this.model.numStateVars());
    },

    "test should set initial condition to be leak potential" : function () {
        assertEquals(-65e-3, this.model.initialValues()[0]);
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [-75e-3], 0.);
        assertClose(0.25, this.passiveMembrane.V(dy));
    },

    "test should pass state to input currents" : function () {
        var dy = Array(this.model.numStateVars());
        var state = this.model.initialValues;
        var t = 3.2;
        var ICalled = false;

        function I(state1, t1) {
            ICalled = true;
            assertEquals(state, state);
            assertEquals(t, t1);

            return 0;
        };

        this.passiveMembrane.addCurrent(I);
        this.drift(dy, this.model.initialValues(), t);
        assertTrue(ICalled);
    },
    
    "test should sum input currents" : function () {
        var withoutCurrents = Array(this.model.numStateVars());
        var withCurrents = Array(this.model.numStateVars());
        var state = this.model.initialValues;
        var t = 3.2;

        this.drift(withoutCurrents, this.model.initialValues(), 0.);

        this.passiveMembrane.addCurrent(function () { return 1.34e-9; });
        this.passiveMembrane.addCurrent(function () { return 2.4e-9; });

        this.drift(withCurrents, this.model.initialValues(), 0.);

        assertClose(1.87, this.passiveMembrane.V(withCurrents, t) 
                - this.passiveMembrane.V(withoutCurrents, t));
    }
});


TestCase("Pulse", {
    setUp: function () {
        this.pulse = electrophys.pulse({start: 0.1, width: 0.2, height: 0.525});
    },

    "test should return a function" : function () {
        assertTypeOf("function", this.pulse);
    },

    "test should be off before and after the pulse" : function () {
        assertEquals(0, this.pulse([], 0.));
        assertEquals(0, this.pulse([], 0.0999));
        assertEquals(0, this.pulse([], 0.3001));
        assertEquals(0, this.pulse([], 1));
    },

    "test should be equal to the specified amplitude during the pulse" : function () {
        var pulse = electrophys.pulse(0.1, 0.2, 0.525);
        assertEquals(0.525, this.pulse([], 0.1001));
        assertEquals(0.525, this.pulse([], 0.2));
        assertEquals(0.525, this.pulse([], 0.2999));
    }
});
