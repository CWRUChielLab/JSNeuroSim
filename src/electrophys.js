var electrophys = {};

electrophys.passiveConductance = function (neuron, options) {
    "use strict";
    var g = options.g,
        E_rev = options.E_rev;

    function current(state, t) {
        return g * (E_rev - neuron.V(state, t));
    }

    neuron.addCurrent(current);
};


electrophys.hhKConductance = function (model, neuron, options) {
    "use strict";

    var g_K = options.g_K, E_K = options.E_K,
        iN = model.addStateVar(1);

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[iN] = electrophys.hhKConductance.alpha_n(v) * (1 - state[iN]) -
            electrophys.hhKConductance.beta_n(v) * state[iN];
    }
    model.registerDrift(drift);

    neuron.addCurrent(function (state, t) {
        return g_K * state[iN] * state[iN] * state[iN] * state[iN] * 
            (E_K - neuron.V(state, t));
    });

    return {
        n: function (state, t) { return state[iN]; },
    };
};


electrophys.hhKConductance.alpha_n = function (V) {
    "use strict";

    var t_scale = 100, 
        v0 = -55e-3, 
        v_scale = 10e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    if (Math.abs(x) < 1e-9) {
        // avoid dividing by zero
        return t_scale;
    } else {
        return t_scale * x / (Math.exp(x) - 1);
    }
};


electrophys.hhKConductance.beta_n = function (V) {
    "use strict";

    var t_scale = 125, 
        v0 = -65e-3, 
        v_scale = 80e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    return t_scale * Math.exp(x);
};


electrophys.hhNaConductance = function (model, neuron, options) {
    "use strict";

    var g_Na = options.g_Na, E_Na = options.E_Na,
        alpha_h, beta_h, alpha_m, beta_m,
        im = model.addStateVar(0),
        ih = model.addStateVar(1);

    function drift(result, state, t) {
        var v = neuron.V(state, t);
        
        result[im] = electrophys.hhNaConductance.alpha_m(v) * (1 - state[im]) -
            electrophys.hhNaConductance.beta_m(v) * state[im];
        result[ih] = electrophys.hhNaConductance.alpha_h(v) * (1 - state[ih]) -
            electrophys.hhNaConductance.beta_h(v) * state[ih];
    }
    model.registerDrift(drift);

    neuron.addCurrent(function (state, t) {
        return g_Na * state[im] * state[im] * state[im] * state[ih] * 
            (E_Na - neuron.V(state, t));
    });

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; }
    };
};


electrophys.hhNaConductance.alpha_m = function (V) {
    "use strict";

    var t_scale = 1000, 
        v0 = -40e-3, 
        v_scale = 10e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    if (Math.abs(x) < 1e-9) {
        // avoid dividing by zero
        return t_scale;
    } else {
        return t_scale * x / (Math.exp(x) - 1);
    }
};


electrophys.hhNaConductance.beta_m = function (V) {
    "use strict";

    var t_scale = 4000, 
        v0 = -65e-3, 
        v_scale = 18e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    return t_scale * Math.exp(x);
};


electrophys.hhNaConductance.alpha_h = function (V) {
    "use strict";

    var t_scale = 70, 
        v0 = -65e-3, 
        v_scale = 20e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    return t_scale * Math.exp(x);
};


electrophys.hhNaConductance.beta_h = function (V) {
    "use strict";

    var t_scale = 1000, 
        v0 = -35e-3, 
        v_scale = 10e-3, 
        x;
    
    x = (v0 - V) / v_scale;

    return t_scale * (1.0 / (Math.exp(x) + 1));
};


electrophys.passiveMembrane = function (model, options) {
    "use strict";
    var C = options.C,
        g_leak = options.g_leak,
        E_leak = options.E_leak,
        currents = [],
        leak,
        iV = model.addStateVar(E_leak),
        that = {};
    
    function addCurrent(I) {
        currents.push(I);
    }

    function drift(result, state, t) {
        var i = currents.length,
            I_inj = 0;
        
        while (i > 0) {
            i -= 1;
            I_inj += currents[i](state, t);
        }

        result[iV] = I_inj / C;
    }

    model.registerDrift(drift);
    
    that.V = function (state, t) { return state[iV]; };
    that.addCurrent = addCurrent;
    that.leak = electrophys.passiveConductance(that, 
        { E_rev: E_leak, g: g_leak });

    return that;
};


electrophys.pulse = function (options) {
    "use strict";
    var start = options.start,
        width = options.width,
        height = options.height;

    return function (state, t) {
        if (t >= start && t < start + width) {
            return height;
        } else {
            return 0;
        }
    };
};


electrophys.pulseTrain = function (options) {
    "use strict";
    var start = options.start,
        width = options.width,
        height = options.height,
        gap = options.gap,
        num_pulses = options.num_pulses,
        period = width + gap,
        end = start + period * num_pulses - gap;

    return function (state, t) {
        if (t >= start && t < end && (t - start) % period < width) {
            return height;
        } else {
            return 0;
        }
    };
};


electrophys.gettingIFNeuron = function (model, options) {
    "use strict";
    var C = options.C,
        g_leak = options.g_leak,
        E_leak = options.E_leak,
        theta_ss = options.theta_ss,
        theta_r = options.theta_r,
        theta_tau = options.theta_tau,
        currents = [],
        spikeWatchers = [],
        V_rest = options.V_rest || E_leak,
        iV = model.addStateVar(V_rest),
        iTheta = model.addStateVar(theta_ss);
    
    function drift(result, state, t) {
        var i = currents.length,
            I_inj = 0;
        
        while (i > 0) {
            i -= 1;
            I_inj += currents[i](state, t);
        }

        result[iV] = (g_leak * (E_leak - state[iV]) + I_inj) / C;
        result[iTheta] = (theta_ss - state[iTheta]) / theta_tau;
    }

    function jump(state, t) {
        if (state[iV] >= state[iTheta]) {
            state[iTheta] = theta_r;

            var i = spikeWatchers.length;
            
            while (i > 0) {
                i -= 1;
                spikeWatchers[i](state, t);
            }

            return true;
        }
        return false;
    }

    function VWithSpikes(state, t) {
        if (state[iV] instanceof Array) {
            var newV = state[iV].slice(0),
                theta = state[iTheta],
                i = theta.length - 1;
            
            while (i > 0) {
                i -= 1;
                if (theta[i] < theta[i + 1]) {
                    newV[i + 1] = 55e-3;
                }
            }

            return newV;
        } else {
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


electrophys.gettingSynapse = function (model, presynaptic, 
    postsynaptic, options) {

    "use strict";
    var iG_act = model.addStateVar(0),
        iG_o = model.addStateVar(0),
        W = options.W,
        E_rev = options.E_rev,
        tau_open = options.tau_open,
        tau_close = options.tau_close,
        A = 1 / (4 * Math.exp(-3.15 / (tau_close / tau_open)) + 1);

    function drift(result, state, t) {
        result[iG_act] = -state[iG_act] / tau_open;
        result[iG_o] = state[iG_act] / tau_open - state[iG_o] / tau_close;
    }
    model.registerDrift(drift);

    presynaptic.addSpikeWatcher(function (state, t) { 
        state[iG_act] += 1; 
        return true; 
    });

    postsynaptic.addCurrent(function (state, t) {
        return W * state[iG_o] * (E_rev - postsynaptic.V(state, t)) * A;
    });

    return {
        G_act: function (state, t) { return state[iG_act]; },
        G_o: function (state, t) { return state[iG_o]; }
    };
};


electrophys.gettingShuntConductance = function (model, neuron, options) {

    "use strict";
    var G = options.G,
        E_rev = options.E_rev,
        B_m = options.B_m,
        C_m = options.C_m,
        tau_m = options.tau_m,
        B_h = options.B_h,
        C_h = options.C_h,
        tau_h = options.tau_h,
        im = model.addStateVar(1 / (Math.exp((E_rev + B_m) / C_m) + 1)),
        ih = model.addStateVar(1 / (Math.exp((E_rev + B_h) / C_h) + 1));

    function drift(result, state, t) {
        var v = neuron.V(state, t),
            m_inf = 1 / (Math.exp((v + B_m) / C_m) + 1),
            h_inf = 1 / (Math.exp((v + B_h) / C_h) + 1);
        
        result[im] = (m_inf - state[im]) / tau_m;
        result[ih] = (h_inf - state[ih]) / tau_h;
    }
    model.registerDrift(drift);

    neuron.addCurrent(function (state, t) {
        return G * state[im] * state[ih] * (E_rev - neuron.V(state, t));
    });

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; }
    };
};
