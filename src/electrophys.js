var electrophys = {};


electrophys.passiveMembrane = function (model, options) {
    var C = options.C;
    var g_leak = options.g_leak;
    var E_leak = options.E_leak;
    var currents = [];

    var iV = model.addStateVar(E_leak);
    
    function drift(result, state, t) {
        var i = currents.length;
        var I_inj = 0;
        
        while (i > 0) {
            --i;
            I_inj += currents[i](state, t);
        }

        result[iV] = (g_leak * (E_leak - state[iV]) + I_inj)/C;
    }

    model.registerDrift(drift);
    
    return {
        V : function (state, t) { return state[iV]; },
        addCurrent : function (I) { currents.push(I); }
    };
}


electrophys.pulse = function (options) {
    var start = options.start;
    var width = options.width;
    var height = options.height;

    return function (state, t) {
            if (t >= start && t < start + width) {
                return height;
            }
            else {
                return 0;
            }
        };
};


electrophys.gettingIFNeuron = function (model, options) {
    var C = options.C;
    var g_leak = options.g_leak;
    var E_leak = options.E_leak;
    var theta_ss = options.theta_ss;
    var theta_r = options.theta_r;
    var theta_tau = options.theta_tau;
    var currents = [];
    var spikeWatchers = [];
    var V_rest = options.V_rest || E_leak;

    var iV = model.addStateVar(V_rest);
    var iTheta = model.addStateVar(theta_ss);
    
    function drift(result, state, t) {
        var i = currents.length;
        var I_inj = 0;
        
        while (i > 0) {
            --i;
            I_inj += currents[i](state, t);
        }

        result[iV] = (g_leak * (E_leak - state[iV]) + I_inj)/C;
        result[iTheta] = (theta_ss - state[iTheta])/theta_tau;
    }

    function jump(state, t) {
        if (state[iV] >= state[iTheta]) {
            state[iTheta] = theta_r;

            var i = spikeWatchers.length;
            
            while (i > 0) {
                --i;
                spikeWatchers[i](state, t);
            }

            return true;
        }
        return false;
    }

    function VWithSpikes(state, t) {
        if (state[iV] instanceof Array) {
            var newV = state[iV].slice(0);
            var theta = state[iTheta];
            var i = theta.length - 1;
            
            while (i > 0) {
                --i;
                if (theta[i] < theta[i+1]) {
                    newV[i+1] = 55e-3;
                }
            }

            return newV;
        }
        else {
            return state[iV];
        }
    }

    model.registerDrift(drift);
    model.registerJump(jump);
    
    return {
        V : function (state, t) { return state[iV]; },
        VWithSpikes : VWithSpikes,
        theta : function (state, t) { return state[iTheta]; },
        addCurrent : function (I) { currents.push(I); },
        addSpikeWatcher : function (f) { spikeWatchers.push(f); }
    };
};


electrophys.gettingSynapse = function (
        model, presynaptic, postsynaptic, options
        ) {
    var iG_act = model.addStateVar(0);
    var iG_o = model.addStateVar(0);
    var W = options.W;
    var E_rev = options.E_rev;
    var tau_open = options.tau_open;
    var tau_close = options.tau_close;
    var A = 1/(4*Math.exp(-3.15/(tau_close/tau_open)) + 1);

    function drift(result, state, t) {
        result[iG_act] = -state[iG_act] / tau_open;
        result[iG_o] = state[iG_act] / tau_open - state[iG_o] / tau_close;
    }
    model.registerDrift(drift);

    presynaptic.addSpikeWatcher(function (state, t) { 
        state[iG_act]++; 
        return true; 
    });

    postsynaptic.addCurrent(function (state, t) {
        return W * state[iG_o] * (E_rev - postsynaptic.V(state, t)) * A;
    });

    return {
        G_act: function (state, t) { return state[iG_act]; },
        G_o: function (state, t) { return state[iG_o]; },
    };
};


electrophys.gettingShuntConductance = function (
        model, neuron, options
        ) {
    var G = options.G;
    var E_rev = options.E_rev;
    var B_m = options.B_m;
    var C_m = options.C_m;
    var tau_m = options.tau_m;
    var B_h = options.B_h;
    var C_h = options.C_h;
    var tau_h = options.tau_h;
    

    var im = model.addStateVar(1/(Math.exp((E_rev + B_m)/C_m) + 1));
    var ih = model.addStateVar(1/(Math.exp((E_rev + B_h)/C_h) + 1));

    function drift(result, state, t) {
        var v = neuron.V(state, t);
        var m_inf = 1/(Math.exp((v + B_m)/C_m) + 1);
        var h_inf = 1/(Math.exp((v + B_h)/C_h) + 1);
        
        result[im] = (m_inf - state[im]) / tau_m;
        result[ih] = (h_inf - state[ih]) / tau_h;
    }
    model.registerDrift(drift);

    neuron.addCurrent(function (state, t) {
        return G * state[im] * state[ih] * (E_rev - neuron.V(state, t));
    });

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; },
    };
};
