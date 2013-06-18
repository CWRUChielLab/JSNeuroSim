var electrophys = {};

electrophys.passiveConductance = function (neuron, options) {
    "use strict";
    var g = options.g,
        E_rev = options.E_rev;

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g * (E_rev - neuron.V(state, t));
        }
    }

    neuron.addCurrent(current);

    return {
        current: current
    };
};


electrophys.hhKConductance = function (model, neuron, options) {
    "use strict";

    var g_K = options.g_K, 
        E_K = options.E_K,
        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        iN = model.addStateVar(electrophys.hhKConductance.n_infinity(V_rest));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[iN] = electrophys.hhKConductance.alpha_n(v) * (1 - state[iN]) -
            electrophys.hhKConductance.beta_n(v) * state[iN];
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_K * state[iN] * state[iN] * state[iN] * state[iN];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_K - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        n: function (state, t) { return state[iN]; },
        g: g,
        current: current
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


electrophys.hhKConductance.n_infinity = function (V) {
    "use strict";
    
    var alpha = electrophys.hhKConductance.alpha_n(V),
        beta = electrophys.hhKConductance.beta_n(V);
    
    return alpha / (alpha + beta);
};


electrophys.hhKConductance.tau_n = function (V) {
    "use strict";

    var alpha = electrophys.hhKConductance.alpha_n(V),
        beta = electrophys.hhKConductance.beta_n(V);
    
    return 1 / (alpha + beta);
};


electrophys.hhNaConductance = function (model, neuron, options) {
    "use strict";

    var g_Na = options.g_Na, E_Na = options.E_Na,
        alpha_h, beta_h, alpha_m, beta_m,
        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.hhNaConductance.m_infinity(V_rest)),
        ih = model.addStateVar(electrophys.hhNaConductance.h_infinity(V_rest));

    function drift(result, state, t) {
        var v = neuron.V(state, t);
        
        result[im] = electrophys.hhNaConductance.alpha_m(v) * (1 - state[im]) -
            electrophys.hhNaConductance.beta_m(v) * state[im];
        result[ih] = electrophys.hhNaConductance.alpha_h(v) * (1 - state[ih]) -
            electrophys.hhNaConductance.beta_h(v) * state[ih];
    }
    model.registerDrift(drift);

    function g (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_Na * state[im] * state[im] * state[im] * state[ih];
        }
    }

    function current (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Na - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; },
        g: g,
        current: current
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


electrophys.hhNaConductance.m_infinity = function (V) {
    "use strict";

    var alpha = electrophys.hhNaConductance.alpha_m(V),
        beta = electrophys.hhNaConductance.beta_m(V);
    
    return alpha / (alpha + beta);
};


electrophys.hhNaConductance.tau_m = function (V) {
    "use strict";

    var alpha = electrophys.hhNaConductance.alpha_m(V),
        beta = electrophys.hhNaConductance.beta_m(V);
    
    return 1 / (alpha + beta);
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


electrophys.hhNaConductance.h_infinity = function (V) {
    "use strict";

    var alpha = electrophys.hhNaConductance.alpha_h(V),
        beta = electrophys.hhNaConductance.beta_h(V);
    
    return alpha / (alpha + beta);
};


electrophys.hhNaConductance.tau_h = function (V) {
    "use strict";

    var alpha = electrophys.hhNaConductance.alpha_h(V),
        beta = electrophys.hhNaConductance.beta_h(V);
    
    return 1 / (alpha + beta);
};


electrophys.multiConductance = {};

// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.x_infinity = function (V, theta, sigma) {
    "use strict";

    return 1 / (1 + Math.exp((V-theta)/sigma));
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.tau_x = function (V, A, B, theta1, sigma1, theta2, sigma2) {
    "use strict";

    return A / (Math.exp((V-theta1)/sigma1) + Math.exp((V-theta2)/sigma2)) + B;
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.KConductance = function (model, neuron, options) {
    "use strict";

    var g_K = options.g_K, 
        E_K = options.E_K,

        n_inf_theta = options.n_inf_theta || -30e-3,
        n_inf_sigma = options.n_inf_sigma || -25e-3,
        tau_n_A = options.tau_n_A || 2.5e-3,
        tau_n_B = options.tau_n_B || 0.01e-3,
        tau_n_theta1 = options.tau_n_theta1 || -30e-3,
        tau_n_sigma1 = options.tau_n_sigma1 || 40e-3,
        tau_n_theta2 = options.tau_n_theta2 || -30e-3,
        tau_n_sigma2 = options.tau_n_sigma2 || -50e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        iN = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, n_inf_theta, n_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[iN] = (electrophys.multiConductance.x_infinity(v, n_inf_theta, n_inf_sigma) - state[iN]) /
            electrophys.multiConductance.tau_x(v, tau_n_A, tau_n_B, tau_n_theta1, tau_n_sigma1, tau_n_theta2, tau_n_sigma2);
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_K * state[iN] * state[iN] * state[iN] * state[iN];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_K - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        n: function (state, t) { return state[iN]; },
        g: g,
        current: current
    };
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.NaConductance = function (model, neuron, options) {
    "use strict";

    var g_Na = options.g_Na, 
        E_Na = options.E_Na,

        m_inf_theta = options.m_inf_theta || -36e-3,
        m_inf_sigma = options.m_inf_sigma || -8.5e-3,
        tau_m = options.tau_m || 0.1e-3,

        h_inf_theta = options.h_inf_theta || -44.1e-3,
        h_inf_sigma = options.h_inf_sigma || 7e-3,
        tau_h_A = options.tau_h_A || 3.5e-3,
        tau_h_B = options.tau_h_B || 1e-3,
        tau_h_theta1 = options.tau_h_theta1 || -35e-3,
        tau_h_sigma1 = options.tau_h_sigma1 || 4e-3,
        tau_h_theta2 = options.tau_h_theta2 || -35e-3,
        tau_h_sigma2 = options.tau_h_sigma2 || -25e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma)),
        ih = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, h_inf_theta, h_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            tau_m;
        result[ih] = (electrophys.multiConductance.x_infinity(v, h_inf_theta, h_inf_sigma) - state[ih]) /
            electrophys.multiConductance.tau_x(v, tau_h_A, tau_h_B, tau_h_theta1, tau_h_sigma1, tau_h_theta2, tau_h_sigma2);
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_Na * state[im] * state[im] * state[im] * state[ih];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Na - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; },
        g: g,
        current: current
    };
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.NaPConductance = function (model, neuron, options) {
    "use strict";

    var g_NaP = options.g_NaP, 
        E_Na = options.E_Na,

        m_inf_theta = options.m_inf_theta || -47.1e-3,
        m_inf_sigma = options.m_inf_sigma || -4.1e-3,
        tau_m = options.tau_m || 0.1e-3,

        h_inf_theta = options.h_inf_theta || -65e-3,
        h_inf_sigma = options.h_inf_sigma || 5e-3,
        tau_h = options.tau_h || 150e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma)),
        ih = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, h_inf_theta, h_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            tau_m;
        result[ih] = (electrophys.multiConductance.x_infinity(v, h_inf_theta, h_inf_sigma) - state[ih]) /
            tau_h;
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_NaP * state[im] * state[ih];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Na - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; },
        g: g,
        current: current
    };
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.AConductance = function (model, neuron, options) {
    "use strict";

    var g_A = options.g_A, 
        E_K = options.E_K,

        m_inf_theta = options.m_inf_theta || -27e-3,
        m_inf_sigma = options.m_inf_sigma || -16e-3,
        tau_m_A = options.tau_m_A || 1e-3,
        tau_m_B = options.tau_m_B || 0.37e-3,
        tau_m_theta1 = options.tau_m_theta1 || -40e-3,
        tau_m_sigma1 = options.tau_m_sigma1 || 5e-3,
        tau_m_theta2 = options.tau_m_theta2 || -74e-3,
        tau_m_sigma2 = options.tau_m_sigma2 || -7.5e-3,

        h_inf_theta = options.h_inf_theta || -80e-3,
        h_inf_sigma = options.h_inf_sigma || 11e-3,
        tau_h = options.tau_h || 20e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma)),
        ih = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, h_inf_theta, h_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            electrophys.multiConductance.tau_x(v, tau_m_A, tau_m_B, tau_m_theta1, tau_m_sigma1, tau_m_theta2, tau_m_sigma2);
        result[ih] = (electrophys.multiConductance.x_infinity(v, h_inf_theta, h_inf_sigma) - state[ih]) /
            tau_h;
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_A * state[im] * state[ih];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_K - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        m: function (state, t) { return state[im]; },
        h: function (state, t) { return state[ih]; },
        g: g,
        current: current
    };
};


electrophys.gapJunction = function (neuron1, neuron2, options) {
    "use strict";
    var g = options.g;

    function current1(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current1(state, t[i]);});
        } else {
            return g * (neuron2.V(state, t) - neuron1.V(state, t));
        }
    }

    function current2(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current2(state, t[i]);});
        } else {
            return g * (neuron1.V(state, t) - neuron2.V(state, t));
        }
    }

    neuron1.addCurrent(current1);
    neuron2.addCurrent(current2);

    return {
       current1: current1,
       current2: current2
    };
};


electrophys.passiveMembrane = function (model, options) {
    "use strict";
    var C = options.C,
        g_leak = options.g_leak,
        E_leak = options.E_leak,
        V_rest = (options.V_rest === undefined ? E_leak : options.V_rest),
        currents = [],
        leak,
        iV = model.addStateVar(V_rest),
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


electrophys.clampedMembrane = function (options) {
    "use strict";
    var V_clamp = options.V_clamp,
        that = {};

    that.V = V_clamp;
    that.addCurrent = function () {};

    return that;
};


electrophys.pulse = function (options) {
    "use strict";
    var start = options.start,
        width = options.width,
        baseline = options.baseline || 0,
        height = options.height,
        end = start + width;

    function pulse (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return pulse([], t);});
        } else if (t >= start && t < end) {
            return baseline + height;
        } else if (t != null) {
            return baseline;
        } else {
            console.log('t for pulse is null');
            return null;
        }
    };

    return pulse;
};


electrophys.pulseTrain = function (options) {
    "use strict";
    var start = options.start,
        width = options.width,
        baseline = options.baseline || 0,
        height = options.height,
        subsequentHeight = options.subsequentHeight || height,
        gap = options.gap,
        num_pulses = options.num_pulses,
        period = width + gap,
        end = start + period * num_pulses - gap;

    function pulse (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return pulse([], t);});
        } else if (t >= start && t < end && t < start + width) {
            return baseline + height;
        } else if (t >= start + period && t < end && (t - (start + period)) % period < width) {
            return baseline + subsequentHeight;
        } else if (t != null) {
            return baseline;
        } else {
            console.log('t for pulseTrain is null');
            return null;
        }
    };

    return pulse;
};


// Based on Ermentrout, GB, and Terman, DH, Mathematical Foundations of 
// Neuroscience, Springer, 2010, pp 159-160, but substituting a_r/T_max
// for a_r to bring a_r and a_d to similar scales.  
electrophys.synapse = function (model, presynaptic, postsynaptic, options) {

    "use strict";
    var is = model.addStateVar(0),
        E_rev = options.E_rev,
        g_bar = options.g_bar,
        a_r = options.a_r,
        a_d = options.a_d,
        V_T = options.V_T,
        K_p = options.K_p;

    function drift(result, state, t) {
        var s = state[is],
            V = presynaptic.V(state, t),
            T = 1 / (1 + Math.exp(-(V - V_T) / K_p));

        result[is] = a_r * T * (1 - state[is]) - a_d * state[is];
    }
    model.registerDrift(drift);

    function current (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g_bar * state[is] * (E_rev - postsynaptic.V(state, t));
        }
    }
    postsynaptic.addCurrent(current);

    return {
        s: function (state, t) { return state[is]; },
        current: current
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
        V_rest = (options.V_rest === undefined ? E_leak : options.V_rest),
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
        V_rest = (options.V_rest === undefined ? E_rev : options.V_rest),
        im = model.addStateVar(1 / (Math.exp((V_rest + B_m) / C_m) + 1)),
        ih = model.addStateVar(1 / (Math.exp((V_rest + B_h) / C_h) + 1));

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
