TestCase("PassiveConductance", {
    setUp: function () {
        this.model = componentModel.componentModel();

        this.neuron = {};
        this.neuron.addCurrent = sinon.stub();
        this.neuron.V = function (state, t) { return -60e-3; };

        this.passiveConductance = electrophys.passiveConductance(this.neuron, 
            { g: 1e-6, E_rev: -70e-3 });
    },

    "test should have expected current" : function () {
        var current = this.passiveConductance.current([], 3.14);

        assertClose(-10e-9, current, 1e-9, 1e-18);
    }
});


TestCase("Synapse", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");

        this.presynaptic = {};
        this.presynaptic.V = function (state, t) { return 10e-3; };

        this.postsynaptic = {};
        this.postsynaptic.addCurrent = sinon.stub();
        this.postsynaptic.V = function (state, t) { return -60e-3; };

        this.synapse = electrophys.synapse(this.model, 
            this.presynaptic, this.postsynaptic,
            { g_bar: 0.1, E_rev: -15e-3,
                a_r: 1/10e-3, a_d: 1/25e-3, 
                V_T: 2e-3, K_p: 5e-3 });
        this.drift = this.model.registerDrift.args[0][0];
    },

    "test should have one state var" : function () {
        assertEquals(1, this.model.numStateVars());
    },

    "test should set initial s to zero" : function () {
        assertEquals(0, 
                this.synapse.s(this.model.initialValues(), 1));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [ 0.3 ], 0.);
        assertClose(46.241286959374705, // hand calculated
            this.synapse.s(dy, 0));
    },

    "test should have expected current" : function () {
        var state = [ 0.2 ];

        var current = this.synapse.current(state, 3.14);

        assertClose(0.9e-3, current); // hand calculated
    }
});


TestCase("HHKConductance", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");

        this.neuron = {};
        this.neuron.addCurrent = sinon.stub();
        this.neuron.V = function (state, t) { return -30e-3; };

        this.hhK = electrophys.hhKConductance(this.model, 
            this.neuron, { g_K: 1e-6, E_K: -70e-3, V_rest: -60e-3 });
        this.drift = this.model.registerDrift.args[0][0];
    },

    "test should have expected alpha_n" : function () {
        assertClose(315.7187089473768, // hand calculation
            electrophys.hhKConductance.alpha_n(-25e-3));
        assertClose(100, // analytic limit for -55mV
            electrophys.hhKConductance.alpha_n(-55.0000000000001e-3));
        assertClose(100, // analytic limit for -55mV
            electrophys.hhKConductance.alpha_n(-55e-3));
    },

    "test should have expected beta_n" : function () {
        assertClose(110.31211282307443,
            electrophys.hhKConductance.beta_n(-55e-3));
    },

    "test should have expected n_infinity" : function () {
        var c = electrophys.hhKConductance, 
            v = -44e-3;
        assertClose(c.alpha_n(v) / (c.alpha_n(v) + c.beta_n(v)),
            c.n_infinity(v));
    },

    "test should have expected tau_n" : function () {
        var c = electrophys.hhKConductance, 
            v = -44e-3;
        assertClose(1 / (c.alpha_n(v) + c.beta_n(v)), c.tau_n(v));
    },

    "test should have one state var" : function () {
        assertEquals(1, this.model.numStateVars());
    },

    "test should set initial n to n_infinity" : function () {
        assertClose(electrophys.hhKConductance.n_infinity(-60e-3), 
            this.hhK.n(this.model.initialValues(), 1));
    },

    "test should default to n_infinity of -65 mV" : function () {
        var hhK = electrophys.hhKConductance(this.model, 
            this.neuron, { g_K: 1e-6, E_K: -70e-3, });
        assertClose(electrophys.hhKConductance.n_infinity(-65e-3), 
            hhK.n(this.model.initialValues(), 1));
    },

    "test should allow V_rest of 0 mV" : function () {
        var hhK = electrophys.hhKConductance(this.model, 
            this.neuron, { g_K: 1e-6, E_K: -70e-3, V_rest: 0, });
        assertClose(electrophys.hhKConductance.n_infinity(0), 
            hhK.n(this.model.initialValues(), 1));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars()),
            y0 = [0.2];
        this.drift(dy, y0, 0.);
        assertClose(
            electrophys.hhKConductance.alpha_n(this.neuron.V()) * 
            (1 - this.hhK.n(y0)) -
            electrophys.hhKConductance.beta_n(this.neuron.V()) * 
            this.hhK.n(y0),
            this.hhK.n(dy, 0));
    },
    "test should have expected current" : function () {
        var state = [0.2, 0.3];

        var current = this.hhK.current(state, 3.14);

        assertClose(-64e-12, 
            current, 1e-9, 1e-24);
    }
});


TestCase("HHNaConductance", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");

        this.neuron = {};
        this.neuron.addCurrent = sinon.stub();
        this.neuron.V = function (state, t) { return -30e-3; };

        this.hhNa = electrophys.hhNaConductance(this.model, 
            this.neuron, { g_Na: 1e-6, E_Na: -70e-3, V_rest: -60e-3 });
        this.drift = this.model.registerDrift.args[0][0];
    },

    "test should have expected alpha_m" : function () {
        assertClose(430.8253751833024, // hand calculation
            electrophys.hhNaConductance.alpha_m(-55e-3));
        assertClose(1000, // analytic limit for -40mV
            electrophys.hhNaConductance.alpha_m(-40.00000000000001e-3));
        assertClose(1000, // analytic limit for -40mV
            electrophys.hhNaConductance.alpha_m(-40e-3));
    },

    "test should have expected beta_m" : function () {
        assertClose(2295.013682949731, // hand calculation
            electrophys.hhNaConductance.beta_m(-55e-3));
    },

    "test should have expected m_infinity" : function () {
        var c = electrophys.hhNaConductance, 
            v = -44e-3;
        assertClose(c.alpha_m(v) / (c.alpha_m(v) + c.beta_m(v)),
            c.m_infinity(v));
    },

    "test should have expected tau_m" : function () {
        var c = electrophys.hhNaConductance, 
            v = -44e-3;
        assertClose(1 / (c.alpha_m(v) + c.beta_m(v)), c.tau_m(v));
    },

    "test should have expected alpha_h" : function () {
        assertClose(42.45714617988434, // hand calculation
            electrophys.hhNaConductance.alpha_h(-55e-3));
    },

    "test should have expected beta_h" : function () {
        assertClose(119.20292202211755, // hand calculation
            electrophys.hhNaConductance.beta_h(-55e-3));
    },

    "test should have expected h_infinity" : function () {
        var c = electrophys.hhNaConductance, 
            v = -44e-3;
        assertClose(c.alpha_h(v) / (c.alpha_h(v) + c.beta_h(v)),
            c.h_infinity(v));
    },

    "test should have expected tau_h" : function () {
        var c = electrophys.hhNaConductance, 
            v = -44e-3;
        assertClose(1 / (c.alpha_h(v) + c.beta_h(v)), c.tau_h(v));
    },

    "test should have two state vars" : function () {
        assertEquals(2, this.model.numStateVars());
    },

    "test should set initial m to m_infinity" : function () {
        assertClose(electrophys.hhNaConductance.m_infinity(-60e-3), 
            this.hhNa.m(this.model.initialValues(), 1));
    },

    "test should default to m_infinity of -65 mV" : function () {
        var hhNa = electrophys.hhNaConductance(this.model, 
            this.neuron, { g_Na: 1e-6, E_Na: -70e-3 });
        assertClose(electrophys.hhNaConductance.m_infinity(-65e-3), 
            hhNa.m(this.model.initialValues(), 1));
    },

    "test should set initial h to h_infinity" : function () {
        assertClose(electrophys.hhNaConductance.h_infinity(-60e-3), 
            this.hhNa.h(this.model.initialValues(), 1));
    },

    "test should default to h_infinity of -65 mV" : function () {
        var hhNa = electrophys.hhNaConductance(this.model, 
            this.neuron, { g_Na: 1e-6, E_Na: -70e-3 });
        assertClose(electrophys.hhNaConductance.h_infinity(-65e-3), 
            hhNa.h(this.model.initialValues(), 1));
    },

    "test should allow V_rest of 0 mV" : function () {
        var hhNa = electrophys.hhNaConductance(this.model, 
            this.neuron, { g_Na: 1e-6, E_Na: -70e-3, V_rest: 0 });
        assertClose(electrophys.hhNaConductance.m_infinity(0), 
            hhNa.m(this.model.initialValues(), 1));
        assertClose(electrophys.hhNaConductance.h_infinity(0), 
            hhNa.h(this.model.initialValues(), 1));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars()),
            y0 = [0.2, 0.3];
        this.drift(dy, y0, 0.);
        assertClose(
            electrophys.hhNaConductance.alpha_m(this.neuron.V()) * 
            (1 - this.hhNa.m(y0)) -
            electrophys.hhNaConductance.beta_m(this.neuron.V()) * 
            this.hhNa.m(y0),
            this.hhNa.m(dy, 0));
        assertClose(
            electrophys.hhNaConductance.alpha_h(this.neuron.V()) * 
            (1 - this.hhNa.h(y0)) -
            electrophys.hhNaConductance.beta_h(this.neuron.V()) * 
            this.hhNa.h(y0),
            this.hhNa.h(dy, 0));
    },

    "test should have expected current" : function () {
        var state = [0.2, 0.3];

        var current = this.hhNa.current(state, 3.14);

        assertClose(-96e-12, 
            current, 1e-9, 1e-18);
    }
});


TestCase("gapJunction", {
    setUp: function () {
        this.neuron1 = {};
        this.neuron1.addCurrent = sinon.stub();
        this.neuron1.V = function (state, t) { return -60e-3; };

        this.neuron2 = {};
        this.neuron2.addCurrent = sinon.stub();
        this.neuron2.V = function (state, t) { return 20e-3; };

        this.gapJunction = electrophys.gapJunction(
            this.neuron1, this.neuron2, { g: 2e-6 }
            );
    },

    "test should have expected current" : function () {
        assertClose(160e-9, this.gapJunction.current1([], 3.14));
        assertClose(-160e-9, this.gapJunction.current2([], 3.14));
    }
});


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

    "test should have passive leak conductance" : function () {
        assertObject(this.passiveMembrane.leak);
    },

    "test should set initial condition to be leak potential" : function () {
        assertEquals(-65e-3, 
            this.passiveMembrane.V(this.model.initialValues(), 0));
    },

    "test if V_rest is given, should set initial condition to be V_rest" : 
        function () {
        var passiveMembrane = electrophys.passiveMembrane(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3, V_rest: -120e-3 });
        assertEquals(-120e-3, passiveMembrane.V(this.model.initialValues(), 0));
        var passiveMembrane0 = electrophys.passiveMembrane(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3, V_rest: 0 });
        assertEquals(0, passiveMembrane0.V(this.model.initialValues(), 0));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [-75e-3], 0.);
        assertClose(0.25, this.passiveMembrane.V(dy, 0));
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


TestCase("ClampedMembrane", {
    setUp: function () {
        this.clamp = function (state, t) { return state[0] +t; };
        this.clampedMembrane = electrophys.clampedMembrane(
            { V_clamp : this.clamp });
    },

    "test V should return V_clamp" : function () {
        assertEquals(this.clamp, this.clampedMembrane.V);
    },

    "test can add new currents" : function () {
        assertFunction(this.clampedMembrane.addCurrent);
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
        assertEquals(0.525, this.pulse([], 0.1001));
        assertEquals(0.525, this.pulse([], 0.2));
        assertEquals(0.525, this.pulse([], 0.2999));
    }
});


TestCase("PulseTrain", {
    setUp: function () {
        this.pulseTrain = electrophys.pulseTrain(
            {start: 0.1, width: 0.2, height: 0.525, gap: 0.3, num_pulses: 4});
    },

    "test should return a function" : function () {
        assertTypeOf("function", this.pulseTrain);
    },

    "test should be off before and after the pulseTrain" : function () {
        assertEquals(0, this.pulseTrain([], 0.));
        assertEquals(0, this.pulseTrain([], 0.0999));
        assertEquals(0, this.pulseTrain([], 1.8001));
        assertEquals(0, this.pulseTrain([], 3));
    },

    "test should be off  between pulses" : function () {
        assertEquals(0, this.pulseTrain([], 0.3001));
        assertEquals(0, this.pulseTrain([], 0.5999));

        assertEquals(0, this.pulseTrain([], 0.9));

        assertEquals(0, this.pulseTrain([], 1.3001));
        assertEquals(0, this.pulseTrain([], 1.5999));
    },

    "test should be equal to the specified amplitude during the pulses" : function () {
        assertEquals(0.525, this.pulseTrain([], 0.1001));
        assertEquals(0.525, this.pulseTrain([], 0.2));
        assertEquals(0.525, this.pulseTrain([], 0.2999));

        assertEquals(0.525, this.pulseTrain([], 0.7));

        assertEquals(0.525, this.pulseTrain([], 0.12));

        assertEquals(0.525, this.pulseTrain([], 1.7));
        assertEquals(0.525, this.pulseTrain([], 1.7999));
    },

    "test should be equal to the specified amplitude during subsequent pulses" : function () {
        this.pulseTrain = electrophys.pulseTrain(
            {start: 0.1, width: 0.2, height: 0.525, subsequentHeight: 0.875, gap: 0.3, num_pulses: 4});

        assertEquals(0.875, this.pulseTrain([], 0.6001));
        assertEquals(0.875, this.pulseTrain([], 0.7));
        assertEquals(0.875, this.pulseTrain([], 0.7999));
        assertEquals(0.875, this.pulseTrain([], 1.2));
        assertEquals(0.875, this.pulseTrain([], 1.7));
    },

    "test should be off when num_pulses is 0" : function () {
        this.pulseTrain = electrophys.pulseTrain(
            {start: 0.1, width: 0.2, height: 0.525, gap: 0.3, num_pulses: 0});

        assertEquals(0, this.pulseTrain([], 0.2));
    },
});


TestCase("GettingIFNeuron", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");
        sinon.spy(this.model, "registerJump");
        
        this.gettingIFNeuron = electrophys.gettingIFNeuron(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3, 
                theta_ss: -40e-3, theta_r: 5e-3, theta_tau: 10e-3 });
        this.drift = this.model.registerDrift.args[0][0];
        this.jump = this.model.registerJump.args[0][0];
    },

    "test should have two state vars" : function () {
        assertEquals(2, this.model.numStateVars());
    },

    "test should use the leak potential as initial potential by default" : function () {
        assertEquals(-65e-3, this.gettingIFNeuron.V(this.model.initialValues(), 0));
    },

    "test should set initial theta to be steady state" : function () {
        assertEquals(-40e-3, this.gettingIFNeuron.theta(this.model.initialValues(), 0));
    },

    "test should be able to overide resting potential" : function () {
        this.gettingIFNeuron = electrophys.gettingIFNeuron(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3, 
                theta_ss: -40e-3, theta_r: 5e-3, theta_tau: 10e-3, V_rest: -123e-3 });
        assertEquals(-123e-3, this.gettingIFNeuron.V(this.model.initialValues(), 0));
        this.gettingIFNeuron = electrophys.gettingIFNeuron(this.model, 
            { C: 2e-9, g_leak: 50e-9, E_leak: -65e-3, 
                theta_ss: -40e-3, theta_r: 5e-3, theta_tau: 10e-3, V_rest: 0 });
        assertEquals(0, this.gettingIFNeuron.V(this.model.initialValues(), 0));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [-75e-3, -20e-3 ], 0.);
        assertClose(0.25, this.gettingIFNeuron.V(dy));
        assertClose(-2, this.gettingIFNeuron.theta(dy));
    },

    "test should not jump when below theta" : function () {
        var originalState = [-10e-3, -5e-3];
        var state = originalState.slice(0);
        
        var jumped = this.jump(state, 0);

        assertFalse(jumped);
        assertEquals(originalState, state);
    },

    "test theta should jump to theta_r when V is above theta_ss" : function () {
        var originalState = [-10e-3, -15e-3];
        var state = originalState.slice(0);
        
        var jumped = this.jump(state, 0);

        assertTrue(jumped);
        assertEquals(-10e-3, this.gettingIFNeuron.V(state, 0));
        assertEquals(5e-3, this.gettingIFNeuron.theta(state, 0));
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

        this.gettingIFNeuron.addCurrent(I);
        this.drift(dy, this.model.initialValues(), t);
        assertTrue(ICalled);
    },
    
    "test should sum input currents" : function () {
        var withoutCurrents = Array(this.model.numStateVars());
        var withCurrents = Array(this.model.numStateVars());
        var state = this.model.initialValues;
        var t = 3.2;

        this.drift(withoutCurrents, this.model.initialValues(), 0.);

        this.gettingIFNeuron.addCurrent(function () { return 1.34e-9; });
        this.gettingIFNeuron.addCurrent(function () { return 2.4e-9; });

        this.drift(withCurrents, this.model.initialValues(), 0.);

        assertClose(1.87, this.gettingIFNeuron.V(withCurrents, t) 
                - this.gettingIFNeuron.V(withoutCurrents, t));
    },

    "test VWithSpikes should return the voltage when called with a single state" 
        : function () {
        var state = [0.1, 0.2];
        assertEquals(0.1, this.gettingIFNeuron.VWithSpikes(state));
    },

    "test VWithSpikes shoult return a copy with spikes wherever theta increases"
        : function () {
        var y = [[1e-3, 2e-3, 3e-3, 4e-3, 5e-3, 6e-3], [ 10, 11, 9, 8, 9, 7 ]];
        var withSpikes = this.gettingIFNeuron.VWithSpikes(y);

        assertEquals([1e-3, 55e-3, 3e-3, 4e-3, 55e-3, 6e-3], withSpikes);
        assertEquals([1e-3, 2e-3, 3e-3, 4e-3, 5e-3, 6e-3], this.gettingIFNeuron.V(y));
    },

    "test should not call spike functions when the neuron does not spike"
        : function () {
        var state = [-10e-3, -5e-3];
        var stub = sinon.stub() 
        
        this.gettingIFNeuron.addSpikeWatcher(stub);
        this.jump(state, 0);

        assertFalse(stub.called);
    },

    "test should call spike functions when the neuron spikes"
        : function () {
        var state = [-1e-3, -5e-3];
        var t = 1.3;

        function stub(stateIn, tIn) {
            assertEquals(state, stateIn);
            assertEquals(t, tIn);
            stub.called = true;
        }
        stub.called = false;
        
        this.gettingIFNeuron.addSpikeWatcher(stub);
        this.jump(state, t);

        assertTrue(stub.called);
    }
});


TestCase("GettingSynapse", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");

        this.presynaptic = {};
        this.presynaptic.addSpikeWatcher = sinon.stub();

        this.postsynaptic = {};
        this.postsynaptic.addCurrent = sinon.stub();
        this.postsynaptic.V = function (state, t) { return 20e-3; };

        this.gettingSynapse = electrophys.gettingSynapse(this.model, 
            this.presynaptic, this.postsynaptic,
            { W: 0.12, E_rev: -80e-3, tau_open: 10e-3, tau_close: 30e-3 });
        this.drift = this.model.registerDrift.args[0][0];
        this.spikeWatcher = this.presynaptic.addSpikeWatcher.args[0][0];
        this.current = this.postsynaptic.addCurrent.args[0][0];
    },

    "test should have two state vars" : function () {
        assertEquals(2, this.model.numStateVars());
    },

    "test should set initial G_act to zero" : function () {
        assertEquals(0, 
                this.gettingSynapse.G_act(this.model.initialValues(), 1));
    },

    "test should set initial G_o to zero" : function () {
        assertEquals(0, 
                this.gettingSynapse.G_o(this.model.initialValues(), 1));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [ 20e-3, 90e-3 ], 0.);
        assertClose(-2, this.gettingSynapse.G_act(dy, 0));
        assertClose(-1, this.gettingSynapse.G_o(dy, 0));
    },

    "test should increment G_act by one when a spike happens" : function () {
        var originalState = [ 2.34, 0.72 ];
        var state = originalState.slice(0);
        
        var jumped = this.spikeWatcher(state, 0);

        assertTrue(jumped);
        assertClose(3.34, this.gettingSynapse.G_act(state, 0));
        assertEquals(0.72, this.gettingSynapse.G_o(state, 0));
    },

    "test should have expected current" : function () {
        var state = [ 1e99, 0.12];

        var current = this.current(state, 3.14);

        assertClose(-0.000600062257348, current);
    }
});


TestCase("GettingShuntConductance", {
    setUp: function () {
        this.model = componentModel.componentModel();
        sinon.spy(this.model, "registerDrift");

        this.neuron = {};
        this.neuron.addCurrent = sinon.stub();
        this.neuron.V = function (state, t) { return -60e-3; };

        this.gettingShunt = electrophys.gettingShuntConductance(this.model, 
            this.neuron, 
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3 });
        this.drift = this.model.registerDrift.args[0][0];
        this.current = this.neuron.addCurrent.args[0][0];
    },

    "test should have two state vars" : function () {
        assertEquals(2, this.model.numStateVars());
    },

    "test should set initial m to m_inf" : function () {
        assertClose(0.0116073164453, // calculated in python
                this.gettingShunt.m(this.model.initialValues(), 1));
    },

    "test should set initial h to h_inf" : function () {
        assertClose(0.9820137900379, // calculated in python
                this.gettingShunt.h(this.model.initialValues(), 1));
    },

    "test should set initial m to m_inf for V_rest if given" : function () {
        var gettingShunt = electrophys.gettingShuntConductance(this.model, 
            this.neuron, 
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3, V_rest: -60e-3 });
        assertClose(0.03444519566621117, // calculated in python
                gettingShunt.m(this.model.initialValues(), 1));
        var gettingShunt0 = electrophys.gettingShuntConductance(this.model, 
            this.neuron, 
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3, V_rest: 0 });
        assertClose(0.96555480433378882, // calculated in python
                gettingShunt0.m(this.model.initialValues(), 1));
    },

    "test should set initial h to h_inf for V_rest if given" : function () {
        var gettingShunt = electrophys.gettingShuntConductance(this.model, 
            this.neuron, 
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3, V_rest: -60e-3 });
        assertClose(0.8175744761936437, // calculated in python
                gettingShunt.h(this.model.initialValues(), 1));
        var gettingShunt0 = electrophys.gettingShuntConductance(this.model, 
            this.neuron, 
            { G: 1e-6, E_rev: -70e-3, B_m: 30e-3, C_m: -9e-3, tau_m: 10e-3,
                B_h: 54e-3, C_h: 4e-3, tau_h: 600e-3, V_rest: 0 });
        assertClose(1.370957207e-6, // calculated in python
                gettingShunt0.h(this.model.initialValues(), 1));
    },

    "test should have expected drift" : function () {
        var dy = Array(this.model.numStateVars());
        this.drift(dy, [ 0.2, 0.3 ], 0.);
        assertClose(-16.555480433378882, this.gettingShunt.m(dy, 0));
        assertClose(0.862624126989406, this.gettingShunt.h(dy, 0));
    },

    "test should have expected current" : function () {
        var state = [ 0.2, 0.3 ];

        var current = this.current(state, 3.14);

        assertClose(-6e-10, current, 1e-9, 1e-18);
    }
});

