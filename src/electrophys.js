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


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.HConductance = function (model, neuron, options) {
    "use strict";

    var g_H = options.g_H, 
        E_H = options.E_H,

        m_inf_theta = options.m_inf_theta || -79.8e-3,
        m_inf_sigma = options.m_inf_sigma || 5.3e-3,
        tau_m_A = options.tau_m_A || 475e-3,
        tau_m_B = options.tau_m_B || 50e-3,
        tau_m_theta1 = options.tau_m_theta1 || -70e-3,
        tau_m_sigma1 = options.tau_m_sigma1 || 11e-3,
        tau_m_theta2 = options.tau_m_theta2 || -70e-3,
        tau_m_sigma2 = options.tau_m_sigma2 || -11e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            electrophys.multiConductance.tau_x(v, tau_m_A, tau_m_B, tau_m_theta1, tau_m_sigma1, tau_m_theta2, tau_m_sigma2);
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_H * state[im];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_H - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current);

    return {
        m: function (state, t) { return state[im]; },
        g: g,
        current: current
    };
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.TConductance = function (model, neuron, options) {
    "use strict";

    var g_T = options.g_T, 
        E_Ca = options.E_Ca,

        m_inf_theta = options.m_inf_theta || -38e-3,
        m_inf_sigma = options.m_inf_sigma || -5e-3,
        tau_m_A = options.tau_m_A || 5e-3,
        tau_m_B = options.tau_m_B || 2e-3,
        tau_m_theta1 = options.tau_m_theta1 || -28e-3,
        tau_m_sigma1 = options.tau_m_sigma1 || 25e-3,
        tau_m_theta2 = options.tau_m_theta2 || -28e-3,
        tau_m_sigma2 = options.tau_m_sigma2 || -70e-3,

        h_inf_theta = options.h_inf_theta || -70.1e-3,
        h_inf_sigma = options.h_inf_sigma || 7e-3,
        tau_h_A = options.tau_h_A || 20e-3,
        tau_h_B = options.tau_h_B || 1e-3,
        tau_h_theta1 = options.tau_h_theta1 || -70e-3,
        tau_h_sigma1 = options.tau_h_sigma1 || 65e-3,
        tau_h_theta2 = options.tau_h_theta2 || -70e-3,
        tau_h_sigma2 = options.tau_h_sigma2 || -65e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma)),
        ih = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, h_inf_theta, h_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            electrophys.multiConductance.tau_x(v, tau_m_A, tau_m_B, tau_m_theta1, tau_m_sigma1, tau_m_theta2, tau_m_sigma2);
        result[ih] = (electrophys.multiConductance.x_infinity(v, h_inf_theta, h_inf_sigma) - state[ih]) /
            electrophys.multiConductance.tau_x(v, tau_h_A, tau_h_B, tau_h_theta1, tau_h_sigma1, tau_h_theta2, tau_h_sigma2);
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_T * state[im] * state[ih];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Ca - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current, true);

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
electrophys.multiConductance.NConductance = function (model, neuron, options) {
    "use strict";

    var g_N = options.g_N, 
        E_Ca = options.E_Ca,

        m_inf_theta = options.m_inf_theta || -30e-3,
        m_inf_sigma = options.m_inf_sigma || -6e-3,
        tau_m = options.tau_m || 5e-3,

        h_inf_theta = options.h_inf_theta || -70e-3,
        h_inf_sigma = options.h_inf_sigma || 3e-3,
        tau_h = options.tau_h || 25e-3,

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
            return g_N * state[im] * state[ih];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Ca - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current, true);

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
electrophys.multiConductance.PConductance = function (model, neuron, options) {
    "use strict";

    var g_P = options.g_P, 
        E_Ca = options.E_Ca,

        m_inf_theta = options.m_inf_theta || -17e-3,
        m_inf_sigma = options.m_inf_sigma || -3e-3,
        tau_m = options.tau_m || 10e-3,

        V_rest = (options.V_rest === undefined ? -65e-3 : options.V_rest),
        im = model.addStateVar(electrophys.multiConductance.x_infinity(V_rest, m_inf_theta, m_inf_sigma));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[im] = (electrophys.multiConductance.x_infinity(v, m_inf_theta, m_inf_sigma) - state[im]) /
            tau_m;
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_P * state[im];
        }
    }

    function current(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g(state, t) * (E_Ca - neuron.V(state, t));
        }
    }
    neuron.addCurrent(current, true);

    return {
        m: function (state, t) { return state[im]; },
        g: g,
        current: current
    };
};


// Based on
// Purvis LK, Butera RJ. (2005). Ionic Current Model of
// a Hypoglossal Motorneuron. J Neurophysiol 93: 723-733.
electrophys.multiConductance.SKConductance = function (model, neuron, options) {
    "use strict";

    var g_SK = options.g_SK, 
        E_K = options.E_K,

        z_inf_theta = options.z_inf_theta || 0.003,
        tau_z = options.tau_z || 1e-3,

        Ca_init = options.Ca_init || 0,
        iz = model.addStateVar(1 / (1 + (z_inf_theta / Ca_init) * (z_inf_theta / Ca_init)));

    function drift(result, state, t) {
        
        var v = neuron.V(state, t);
        
        result[iz] = ((1 / (1 + (z_inf_theta / neuron.Ca(state, t)) * (z_inf_theta / neuron.Ca(state, t)))) - state[iz]) / tau_z;
    }
    model.registerDrift(drift);

    function g(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return g(state, t[i]);});
        } else {
            return g_SK * state[iz] * state[iz];
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
        z: function (state, t) { return state[iz]; },
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
        Ca_init = options.Ca_init || 0,
        Ca_steady = options.Ca_steady || 0,
        K1 = options.K1 || 0,
        K2 = options.K2 || 0,
        currents = [],
        CaCurrents = [],
        leak,
        iV = model.addStateVar(V_rest),
        iCa = model.addStateVar(Ca_init),
        that = {};
    
    function addCurrent(I, isCaCurrent) {
        var isCaCurrent = isCaCurrent || false;

        currents.push(I);
        if (isCaCurrent) {
            CaCurrents.push(I);
        }
    }

    function drift(result, state, t) {
        var i = currents.length,
            I_inj = 0,
            I_Ca = 0;
        
        while (i > 0) {
            i -= 1;
            I_inj += currents[i](state, t);
        }

        i = CaCurrents.length;
        while (i > 0) {
            i -= 1;
            I_Ca += CaCurrents[i](state, t);
        }

        result[iV] = I_inj / C;
        if (state[iCa] <= 0 && I_Ca < 0) {
            result[iCa] = 0;
        } else {
            result[iCa] = K1 * I_Ca - K2 * (state[iCa] - Ca_steady);
        }
    }

    model.registerDrift(drift);
    
    that.V = function (state, t) { return state[iV]; };
    that.Ca = function (state, t) { return state[iCa]; };
    that.addCurrent = addCurrent;
    that.leak = electrophys.passiveConductance(that, 
        { E_rev: E_leak, g: g_leak });

    return that;
};


electrophys.clampedMembrane = function (model, options) {
    "use strict";
    var V_clamp = options.V_clamp,
        Ca_init = options.Ca_init || 0,
        Ca_steady = options.Ca_steady || 0,
        CaCurrents = [],
        K1 = options.K1 || 0,
        K2 = options.K2 || 0,
        iCa = model.addStateVar(Ca_init),
        that = {};

    function addCurrent(I, isCaCurrent) {
        var isCaCurrent = isCaCurrent || false;

        if (isCaCurrent) {
            CaCurrents.push(I);
        }
    }

    function drift(result, state, t) {
        var i = CaCurrents.length,
            I_Ca = 0;
        
        while (i > 0) {
            i -= 1;
            I_Ca += CaCurrents[i](state, t);
        }

        if (state[iCa] <= 0 && I_Ca < 0) {
            result[iCa] = 0;
        } else {
            result[iCa] = K1 * I_Ca - K2 * (state[iCa] - Ca_steady);
        }
    }

    model.registerDrift(drift);

    that.V = V_clamp;
    that.Ca = function (state, t) { return state[iCa]; };
    that.addCurrent = addCurrent;

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


electrophys.trianglePulse = function (options) {
    "use strict";
    var start = options.start,
        risetime = options.risetime,
        falltime = options.falltime,
        baseline = options.baseline || 0,
        height = options.height,
        tmid = start + risetime,
        tend = start + risetime + falltime;

    function pulse (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return pulse([], t);});
        } else if (t >= start && t < tmid) {
            return baseline + height / risetime * (t - start);
        } else if (t >= tmid && t < tend) {
            return baseline - height / falltime * (t - tend);
        } else if (t != null) {
            return baseline;
        } else {
            console.log('t for trianglePulse is null');
            return null;
        }
    };

    return pulse;
};


electrophys.trianglePulseTrain = function (options) {
    "use strict";
    var start = options.start,
        risetime = options.risetime,
        falltime = options.falltime,
        width = risetime + falltime,
        baseline = options.baseline || 0,
        height = options.height,
        subsequentHeight = options.subsequentHeight || height,
        num_pulses = options.num_pulses,
        gap = options.gap,
        period = width + gap,
        end = start + period * num_pulses - gap;

    function pulse (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return pulse([], t);});
        } else if (t >= start && t < end) {
            var i, p = baseline;

            for (i=0; i<num_pulses; i++) {
                if (i==0) {
                    p += electrophys.trianglePulse({
                        start: start,
                        risetime: risetime,
                        falltime: falltime,
                        baseline: 0,
                        height: height
                    })(state, t);
                } else {
                    p += electrophys.trianglePulse({
                        start: start + period * i,
                        risetime: risetime,
                        falltime: falltime,
                        baseline: 0,
                        height: subsequentHeight
                    })(state, t);
                }
            }
            return p;
        } else if (t != null) {
            return baseline;
        } else {
            console.log('t for trianglePulseTrain is null');
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


// Based on Ermentrout, GB, and Terman, DH, Mathematical Foundations of 
// Neuroscience, Springer, 2010, pp 159-160, but substituting a_r/T_max
// for a_r to bring a_r and a_d to similar scales, and plasticity added
// by making g a function of presynaptic calcium.  
electrophys.plasticSynapse = function (model, presynaptic, postsynaptic, options) {

    "use strict";
    var is = model.addStateVar(0),
        E_rev = options.E_rev,
        g_normalized = options.g_normalized,
        Ca_facilitation = options.Ca_facilitation,
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
            var Ca = presynaptic.Ca(state,t);

            return (g_normalized * (1 + Ca / Ca_facilitation)) * state[is] * (E_rev - postsynaptic.V(state, t));
        }
    }
    postsynaptic.addCurrent(current);

    return {
        s: function (state, t) { return state[is]; },
        current: current
    };
};


// Based on Destexhe A, Mainen ZF and Sejnowski TJ, An efficient method
// for computing synaptic conductances based on a kinetic model of receptor
// binding, Neural Computation 6: 14-18, 1994.
electrophys.simpleDiscreteEventSynapse = function (model, presynaptic, postsynaptic, options) {
    "use strict";

    var ir              = model.addStateVar(0),
        iTransmitter    = model.addStateVar(0),
        iLastPreV       = model.addStateVar(-1e10),
        iLastSpike      = model.addStateVar(-1e10),
        E_rev           = options.E_rev,
        g_bar           = options.g_bar,
        alpha           = options.alpha,
        beta            = options.beta,
        transmitter_max = options.transmitter_max,
        threshold       = options.threshold,
        duration        = options.duration;

    function drift(result, state, t) {
        result[ir] = alpha * state[iTransmitter] * (1 - state[ir]) - beta * state[ir];
        result[iTransmitter] = 0;
        result[iLastPreV] = 0;
        result[iLastSpike] = 0;
    }
    model.registerDrift(drift);

    function jump(state, t) {
        if (state[iLastPreV] < threshold && presynaptic.V(state, t) >= threshold) {
            state[iLastSpike] = t;
            state[iTransmitter] = transmitter_max;
        }
        if (t > state[iLastSpike] + duration) {
            state[iTransmitter] = 0;
        }
        state[iLastPreV] = presynaptic.V(state, t);
        return true;
    }
    model.registerJump(jump);

    function current (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return g_bar * state[ir] * (E_rev - postsynaptic.V(state, t));
        }
    }
    postsynaptic.addCurrent(current);

    return {
        r: function (state, t) { return state[ir]; },
        transmitter: function (state, t) { return state[iTransmitter]; },
        current: current
    };
};


// Based on Destexhe A, Mainen ZF and Sejnowski TJ, An efficient method
// for computing synaptic conductances based on a kinetic model of receptor
// binding, Neural Computation 6: 14-18, 1994, with conductance varying
// with intracellular calcium in the postsynaptic cell.
electrophys.AMPASynapse = function (model, presynaptic, postsynaptic, options) {
    "use strict";

    var ir              = model.addStateVar(0),
        is              = model.addStateVar(0),
        iTransmitter    = model.addStateVar(0),
        iLastPreV       = model.addStateVar(-1e10),
        iLastSpike      = model.addStateVar(-1e10),
        E_rev           = options.E_rev,
        g_max           = options.g_max,
        g_min           = options.g_min,
        alpha           = options.alpha,
        beta            = options.beta,
        transmitter_max = options.transmitter_max,
        threshold       = options.threshold,
        duration        = options.duration;

    function drift(result, state, t) {
        result[ir] = alpha * state[iTransmitter] * (1 - state[ir]) - beta * state[ir];
        result[is] = (electrophys.AMPASynapse.s_infinity(postsynaptic.Ca(state, t)) - state[is]) /
            electrophys.AMPASynapse.tau_s(postsynaptic.Ca(state, t));
        result[iTransmitter] = 0;
        result[iLastPreV] = 0;
        result[iLastSpike] = 0;
    }
    model.registerDrift(drift);

    function jump(state, t) {
        if (state[iLastPreV] < threshold && presynaptic.V(state, t) >= threshold) {
            state[iLastSpike] = t;
            state[iTransmitter] = transmitter_max;
        }
        if (t > state[iLastSpike] + duration) {
            state[iTransmitter] = 0;
        }
        state[iLastPreV] = presynaptic.V(state, t);
        return true;
    }
    model.registerJump(jump);

    function current (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            return (g_min + (g_max - g_min) * state[is]) * state[ir] * (E_rev - postsynaptic.V(state, t));
        }
    }
    postsynaptic.addCurrent(current);

    return {
        r: function (state, t) { return state[ir]; },
        s: function (state, t) { return state[is]; },
        transmitter: function (state, t) { return state[iTransmitter]; },
        current: current
    };
};


electrophys.AMPASynapse.s_infinity = function (Ca) {
    "use strict";
    
    var min    = 0,
        max    = 1,
        center = 0.125, // uM
        shape  = 0.005; // uM

    return min + (max - min) / (1 + Math.exp((center - Ca)/shape));
};


electrophys.AMPASynapse.tau_s = function (Ca) {
    "use strict";
    
    var min    = 0.001,  // s
        max    = 1,      // s
        center = 0.125,  // uM
        shape  = -0.005; // uM

    return min + (max - min) / (1 + Math.exp((center - Ca)/shape));
};


// Based on Destexhe A, Mainen ZF and Sejnowski TJ, An efficient method
// for computing synaptic conductances based on a kinetic model of receptor
// binding, Neural Computation 6: 14-18, 1994, with magnesium block modeled
// based on Jahr CE and Stevens CF, Voltage dependence of NMDA-activated
// macroscopic conductances predicted by single-channel kinetics,
// J Neurosci 10: 3178-3182, 1990.
electrophys.NMDASynapse = function (model, presynaptic, postsynaptic, options) {
    "use strict";

    var ir              = model.addStateVar(0),
        iTransmitter    = model.addStateVar(0),
        iLastPreV       = model.addStateVar(-1e10),
        iLastSpike      = model.addStateVar(-1e10),
        E_rev           = options.E_rev,
        g_bar           = options.g_bar,
        alpha           = options.alpha,
        beta            = options.beta,
        transmitter_max = options.transmitter_max,
        threshold       = options.threshold,
        duration        = options.duration,
        Mg              = options.Mg;

    function drift(result, state, t) {
        result[ir] = alpha * state[iTransmitter] * (1 - state[ir]) - beta * state[ir];
        result[iTransmitter] = 0;
        result[iLastPreV] = 0;
        result[iLastSpike] = 0;
    }
    model.registerDrift(drift);

    function jump(state, t) {
        if (state[iLastPreV] < threshold && presynaptic.V(state, t) >= threshold) {
            state[iLastSpike] = t;
            state[iTransmitter] = transmitter_max;
        }
        if (t > state[iLastSpike] + duration) {
            state[iTransmitter] = 0;
        }
        state[iLastPreV] = presynaptic.V(state, t);
        return true;
    }
    model.registerJump(jump);

    function current (state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return current(state, t[i]);});
        } else {
            // block: V in volts, Mg in millimolar
            var block = 1 / (1 + Math.exp(-62 * postsynaptic.V(state, t)) * (Mg / 3.57));

            return g_bar * state[ir] * block * (E_rev - postsynaptic.V(state, t));
        }
    }
    postsynaptic.addCurrent(current, true);

    return {
        r: function (state, t) { return state[ir]; },
        transmitter: function (state, t) { return state[iTransmitter]; },
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

// Calculates position of tritonia body based on inputs from 2 neurons

electrophys.slugBody = function (model, ventral, dorsal, options) {
"use strict";

    var sigHeight = options.sigHeight,
        beta_ventral = options.beta_ventral,
        gamma_ventral = options.gamma_ventral,
        beta_dorsal = options.beta_dorsal,
        gamma_dorsal = options.gamma_dorsal,
        tauAlpha_ventral = (options.tauAlpha_ventral === undefined ? 3 : options.tauAlpha_ventral),
        tauAlpha_dorsal = (options.tauAlpha_dorsal === undefined ? 3 : options.tauAlpha_dorsal),
        tauV_ventral = (options.tauV_ventral === undefined ? 1 : options.tauV_ventral),
        tauV_dorsal = (options.tauV_dorsal === undefined ? 1 : options.tauV_dorsal),
        iAlpha_ventral = model.addStateVar(0),
        iAlpha_dorsal = model.addStateVar(0),
        iV_ventral = model.addStateVar(0),
        iV_dorsal = model.addStateVar(0);

    function drift(result, state, t) {
        result[iAlpha_ventral] = (electrophys.alpha_inf(state[iV_ventral], beta_ventral, gamma_ventral, sigHeight)
                - state[iAlpha_ventral]) / tauAlpha_ventral;
        result[iAlpha_dorsal] = (electrophys.alpha_inf(state[iV_dorsal], beta_dorsal, gamma_dorsal, sigHeight)
                - state[iAlpha_dorsal]) / tauAlpha_dorsal;
        result[iV_ventral] = (ventral.V(state, t) - state[iV_ventral]) / tauV_ventral;
        result[iV_dorsal] = (dorsal.V(state, t) - state[iV_dorsal]) / tauV_dorsal;
    }
    model.registerDrift(drift);
    
    function bodyAngle(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return bodyAngle(state, t[i]);});
        } else {
            return state[iAlpha_dorsal] - state[iAlpha_ventral];
        }
    }
    
    function angleInf(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return angleInf(state, t[i]);});
        } else {
            return electrophys.alpha_inf(state[iV_dorsal], beta_dorsal, gamma_dorsal, sigHeight) -
                electrophys.alpha_inf(state[iV_ventral], beta_ventral, gamma_ventral, sigHeight);
        }
    }

    return {
        bodyAngle: bodyAngle,
        angleInf: angleInf
    };
}

electrophys.alpha_inf = function (V, beta, gamma, sigHeight) {
    "use strict";
    return sigHeight / (1 + Math.exp(-(V - beta) / gamma));
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


// Current for mechanoreceptor responding to changes in touch intensity

// Based on Gerling GJ, Lesniak DR and Kim EK. "Touch mechanoreceptors: 
// modeling and simulating the skin and receptors to predict the timing of action potentials", 
// Frontiers in Sensing. Ed. Barth FG, Humphrey JAC and Srinivasan MV. New York: 
// Springer Science and Business Media, 2012. 225-238.

electrophys.touchStimuli = function (options) {
    "use strict";
    var Ks = options.Ks,
        Kd_positive = options.Kd_positive,
        Kd_negative = options.Kd_negative || 0,
        
        sigHeight1 = options.sigHeight1,
        sigHeight2 = options.sigHeight2,
        sigHeight3 = options.sigHeight3,
        
        midpointUp1 = options.midpointUp1,
        midpointDown1 = options.midpointDown1,
        midpointUp2 = options.midpointUp2,
        midpointDown2 = options.midpointDown2,
        midpointUp3 = options.midpointUp3,
        midpointDown3 = options.midpointDown3,
        
        growthRateUp1 = options.growthRateUp1,
        growthRateDown1 = options.growthRateDown1,
        growthRateUp2 = options.growthRateUp2,
        growthRateDown2 = options.growthRateDown2,
        growthRateUp3 = options.growthRateUp3,
        growthRateDown3 = options.growthRateDown3,
        
        baseline = options.baseline || 0,
        exponentUp1, exponentDown1,
        exponentUp2, exponentDown2,
        exponentUp3, exponentDown3,        
        touchForce, touchForceDerivative;
                
    function force (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return force([], t);});
        } else {
            return ((sigHeight1 / (1 + Math.exp((-(t - midpointUp1) / growthRateUp1)))) + (sigHeight1 / (1 + Math.exp((t - midpointDown1) / growthRateDown1))) - sigHeight1) +
            ((sigHeight2 / (1 + Math.exp((-(t - midpointUp2) / growthRateUp2)))) + (sigHeight2 / (1 + Math.exp((t - midpointDown2) / growthRateDown2))) - sigHeight2) +
            ((sigHeight3 / (1 + Math.exp((-(t - midpointUp3) / growthRateUp3)))) + (sigHeight3 / (1 + Math.exp((t - midpointDown3) / growthRateDown3))) - sigHeight3);
        }
    }
    
    function pulse (state, t) {
        if (t instanceof Array) {
            return t.map(function (t) {return pulse([], t);});
        } else {
            touchForce = force (state, t);
            
            exponentUp1 = Math.exp((midpointUp1 - t) / growthRateUp1);
            exponentDown1 = Math.exp(-(midpointDown1 - t) / growthRateDown1);
            
            exponentUp2 = Math.exp((midpointUp2 - t) / growthRateUp2);
            exponentDown2 = Math.exp(-(midpointDown2 - t) / growthRateDown2);
            
            exponentUp3 = Math.exp((midpointUp3 - t) / growthRateUp3);
            exponentDown3 = Math.exp(-(midpointDown3 - t) / growthRateDown3);
            
            touchForceDerivative = 
                (((exponentUp1 * sigHeight1)/(Math.pow((1 + exponentUp1), 2) * growthRateUp1)) - 
                ((exponentDown1 * sigHeight1)/(Math.pow((1 + exponentDown1), 2) * growthRateDown1))) + 
                (((exponentUp2 * sigHeight2)/(Math.pow((1 + exponentUp2), 2) * growthRateUp2)) - 
                ((exponentDown2 * sigHeight2)/(Math.pow((1 + exponentDown2), 2) * growthRateDown2))) + 
                (((exponentUp3 * sigHeight3)/(Math.pow((1 + exponentUp3), 2) * growthRateUp3)) - 
                ((exponentDown3 * sigHeight3)/(Math.pow((1 + exponentDown3), 2) * growthRateDown3)));
                
            if (touchForceDerivative < 0) {
                return (Ks * touchForce) + (Kd_negative * touchForceDerivative);
            } else {
                return (Ks * touchForce) + (Kd_positive * touchForceDerivative);
            }
        }
    };        
    
    return {
        pulse: pulse,
        force: force
    };
};


// Based on Chiel HJ, Crago P, Mansour JM, and Hathi K,
// Biomechanics of a muscular hydrostat: a model of lapping
// by a reptilian tongue, Biol. Cybern. 67: 403-415, 1992.
// Here the circumferential muscle is left out, leaving only
// a longitudinal muscle attached to a spring.
electrophys.muscle = function (model, options) {
    "use strict";
    var Linit = (options.Linit === undefined ? 5.0 /* cm */ : options.Linit),
        Ainit = (options.Ainit === undefined ? 0.001        : options.Ainit),
        neuralInput = (options.neuralInput === undefined ? (function(state, t) { return 0.001; }) : options.neuralInput),
        iL = model.addStateVar(Linit),
        iA = model.addStateVar(Ainit),
        that = {},
        // Length/tension parameters
        F0          = (options.F0          === undefined ? 3.2 /* N */            : options.F0),
        a           = (options.a           === undefined ? 1e-1 /* s^-1 */        : options.a),
        b           = (options.b           === undefined ? 1.5e0 /* cm^-1 s^-1 */ : options.b),
        Lmax        = (options.Lmax        === undefined ? 8.0 /* cm */           : options.Lmax),
        // Firing period parameters
        T0          = (options.T0          === undefined ? 120e-3 /* s */         : options.T0),
        Tslope      = (options.Tslope      === undefined ? 50e-3 /* s */          : options.Tslope),
        // Force/velocity parameters
        B           = (options.B           === undefined ? 20e-3 /* s cm^-1 */    : options.B),
        // Activation parameters
        p           = (options.p           === undefined ? 30.3030303 /* s^-1 */  : options.p),
        // Passive force parameters
        c1          = (options.c1          === undefined ? 7.392e-6 /* N */       : options.c1),
        c2          = (options.c2          === undefined ? 2.30259 /* cm^-1 */    : options.c2),
        c3          = (options.c3          === undefined ? 2.30259 /* cm^-1 */    : options.c3),
        Lrestpas    = (options.Lrestpas    === undefined ? 4.0 /* cm */           : options.Lrestpas),
        // Spring force parameters
        k           = (options.k           === undefined ? 0.01 /* N cm^-1 */     : options.k),
        Lrestspring = (options.Lrestspring === undefined ? 6.0 /* cm */           : options.Lrestspring);
    
    function Fiso(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fiso(state, t[i]);});
        } else {
            var Tf = T0 - Tslope * state[iA];
            return -state[iA] * F0 * (1 + (a + b * (state[iL] - Lmax)) * Tf);
        }
    }

    function Fpassive(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fpassive(state, t[i]);});
        } else {
            return -c1 * (Math.exp(c2 * (state[iL] - Lrestpas)) - Math.exp(-c3 * (state[iL] - Lrestpas)));
        }
    }

    function Fspring(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fspring(state, t[i]);});
        } else {
            return -k * (state[iL] - Lrestspring);
        }
    }
    
    // The active muscle force is equal to (1 + B L') * Fiso, but because the sum
    // of forces is assumed to be zero, it is also equal to -(Fpassive + Fspring)
    function Factive(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Factive(state, t[i]);});
        } else {
            return -(Fpassive(state, t) + Fspring(state, t));
        }
    }
    
    function drift(result, state, t) {
        result[iL] = -(Fpassive(state, t) + Fspring(state, t) + Fiso(state, t)) / (B * Fiso(state, t));
        result[iA] = p * (neuralInput(state, t) - state[iA]);
    }

    model.registerDrift(drift);

    that.L = function (state, t) { return state[iL]; };
    that.A = function (state, t) { return state[iA]; };
    that.setNeuralInput = function (func) { neuralInput = func; };
    that.force = Factive;

    return that;
};


// Based on Chiel HJ, Crago P, Mansour JM, and Hathi K,
// Biomechanics of a muscular hydrostat: a model of lapping
// by a reptilian tongue, Biol. Cybern. 67: 403-415, 1992.
// Here the circumferential muscle is left out, leaving only
// a longitudinal muscle attached to a spring. The muscle is
// modelled with mass (the quasi-static approximation is not
// used here).
electrophys.muscleFullDynamics = function (model, options) {
    "use strict";
    var Linit       = (options.Linit       === undefined ? 5.0 /* cm */   : options.Linit),
        Lprimeinit  = (options.Lprimeinit  === undefined ? 0.0 /* cm/s */ : options.Lprimeinit),
        Ainit       = (options.Ainit       === undefined ? 0.0            : options.Ainit),
        neuralInput = (options.neuralInput === undefined ? (function(state, t) { return 0.0; }) : options.neuralInput),
        iL          = model.addStateVar(Linit),
        iLprime     = model.addStateVar(Lprimeinit),
        iA          = model.addStateVar(Ainit),
        that = {},
        // Muscle properties
        m           = (options.m           === undefined ? 100 /* g */            : options.m),
        beta        = (options.beta        === undefined ? 50000 /* g/s */        : options.beta),
        // Length/tension parameters
        F0          = (options.F0          === undefined ? 3.2 /* N */            : options.F0),
        a           = (options.a           === undefined ? 1e-1 /* s^-1 */        : options.a),
        b           = (options.b           === undefined ? 1.5e0 /* cm^-1 s^-1 */ : options.b),
        Lmax        = (options.Lmax        === undefined ? 8.0 /* cm */           : options.Lmax),
        // Firing period parameters
        T0          = (options.T0          === undefined ? 120e-3 /* s */         : options.T0),
        Tslope      = (options.Tslope      === undefined ? 50e-3 /* s */          : options.Tslope),
        // Force/velocity parameters
        B           = (options.B           === undefined ? 20e-3 /* s cm^-1 */    : options.B),
        // Activation parameters
        p           = (options.p           === undefined ? 30.3030303 /* s^-1 */  : options.p),
        // Passive force parameters
        c1          = (options.c1          === undefined ? 7.392e-6 /* N */       : options.c1),
        c2          = (options.c2          === undefined ? 2.30259 /* cm^-1 */    : options.c2),
        c3          = (options.c3          === undefined ? 2.30259 /* cm^-1 */    : options.c3),
        Lrestpas    = (options.Lrestpas    === undefined ? 4.0 /* cm */           : options.Lrestpas),
        // Spring force parameters
        k           = (options.k           === undefined ? 0.01 /* N cm^-1 */     : options.k),
        Lrestspring = (options.Lrestspring === undefined ? 6.0 /* cm */           : options.Lrestspring);
    
    function Fiso(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fiso(state, t[i]);});
        } else {
            var Tf = T0 - Tslope * state[iA];
            return -state[iA] * F0 * (1 + (a + b * (state[iL] - Lmax)) * Tf);
        }
    }

    function Fpassive(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fpassive(state, t[i]);});
        } else {
            return -c1 * (Math.exp(c2 * (state[iL] - Lrestpas)) - Math.exp(-c3 * (state[iL] - Lrestpas)));
        }
    }

    function Fspring(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fspring(state, t[i]);});
        } else {
            return -k * (state[iL] - Lrestspring);
        }
    }
    
    function Factive(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Factive(state, t[i]);});
        } else {
            return Fiso(state, t) * (1 + B * state[iLprime]);
        }
    }

    function Fdamping(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return Fdamping(state, t[i]);});
        } else {
            return -(0.001 * beta) * (0.01 * state[iLprime]); // (kg/s) * (m/s) = N
        }
    }
    
    function drift(result, state, t) {
        result[iL]      = state[iLprime];
        result[iLprime] = (100 * (Fpassive(state, t) + Factive(state, t) + Fspring(state, t) + Fdamping(state, t))) / (0.001 * m); // (kg*cm/s^2) / (kg) = cm/s^2
        result[iA]      = p * (neuralInput(state, t) - state[iA]);
    }

    model.registerDrift(drift);

    that.L      = function (state, t) { return state[iL]; };
    that.Lprime = function (state, t) { return state[iLprime]; };
    that.A      = function (state, t) { return state[iA]; };
    that.setNeuralInput = function (func) { neuralInput = func; };
    that.force  = Factive;

    return that;
};


// Based on Chiel HJ, Crago P, Mansour JM, and Hathi K,
// Biomechanics of a muscular hydrostat: a model of lapping
// by a reptilian tongue, Biol. Cybern. 67: 403-415, 1992.
// This is the full tongue model, including both the
// longitudinal muscle and the circumferential muscle.
electrophys.tongueMuscle = function (model, options) {
    "use strict";
    var LLinit = (options.LLinit === undefined ? 5.0 /* cm */ : options.LLinit),
        ALinit = (options.ALinit === undefined ? 0.001        : options.ALinit),
        ACinit = (options.ACinit === undefined ? 0.001        : options.ACinit),
        inputL = options.inputL,
        inputC = options.inputC,
        iLL = model.addStateVar(LLinit),
        iAL = model.addStateVar(ALinit),
        iAC = model.addStateVar(ACinit),
        that = {},
        // Geometric parameters
        V       = (options.V       === undefined ? 0.64 /* cm^3 */         : options.V),
        LLmax   = (options.LLmax   === undefined ? 8.0 /* cm */            : options.LLmax),
        LCmax   = (options.LCmax   === undefined ? 1.637 /* cm */          : options.LCmax),
        LLrest  = (options.LLrest  === undefined ? 4.0 /* cm */            : options.LLrest),
        LCrest  = (options.LCrest  === undefined ? 1.418 /* cm */          : options.LCrest),
        // Length/tension parameters
        F0L     = (options.F0L     === undefined ? 3.2 /* N */             : options.F0L),
        F0C     = (options.F0C     === undefined ? 6.0 /* N */             : options.F0C),
        aL      = (options.aL      === undefined ? 1.0e-1 /* s^-1 */       : options.aL),
        bL      = (options.bL      === undefined ? 1.5e0 /* cm^-1 s^-1 */  : options.bL),
        aC      = (options.aC      === undefined ? 1.0e-1 /* s^-1 */       : options.aC),
        bC      = (options.bC      === undefined ? 1.18e1 /* cm^-1 s^-1 */ : options.bC),
        // Firing period parameters
        T0L     = (options.T0L     === undefined ? 120e-3 /* s */          : options.T0L),
        TslopeL = (options.TslopeL === undefined ? 50e-3 /* s */           : options.TslopeL),
        T0C     = (options.T0C     === undefined ? 120e-3 /* s */          : options.T0C),
        TslopeC = (options.TslopeC === undefined ? 50e-3 /* s */           : options.TslopeC),
        // Force/velocity parameters
        BL      = (options.BL      === undefined ? 20e-3 /* s cm^-1 */     : options.BL),
        BC      = (options.BC      === undefined ? 158e-3 /* s cm^-1 */    : options.BC),
        // Activation parameters
        p       = (options.p       === undefined ? 30.3030303 /* s^-1 */   : options.p),
        // Passive force parameters
        c1      = (options.c1      === undefined ? 7.392e-6 /* N */        : options.c1),
        c2      = (options.c2      === undefined ? 2.30259 /* cm^-1 */     : options.c2),
        c3      = (options.c3      === undefined ? 2.30259 /* cm^-1 */     : options.c3);
    
    function LC(state, t) {
        if (t instanceof Array) {
            return ode.transpose(state).map(function (state, i) {return LC(state, t[i]);});
        } else {
            return Math.sqrt(4 * Math.PI * V / state[iLL]);
        }
    }

    function drift(result, state, t) {
        var TfL, TfC, FLiso, FCiso, Fp;

        TfL = T0L - TslopeL * state[iAL];
        TfC = T0C - TslopeC * state[iAC];

        FLiso = state[iAL] * F0L * (1 + (aL + bL * (state[iLL]   - LLmax)) * TfL);
        FCiso = state[iAC] * F0C * (1 + (aC + bC * (LC(state, t) - LCmax)) * TfC);

        Fp = c1 * (Math.exp(c2 * (state[iLL] - LLrest)) - Math.exp(-c3 * (state[iLL] - LLrest)));

        result[iLL] = (Math.sqrt(Math.PI * V / (state[iLL] * state[iLL] * state[iLL])) * FCiso - FLiso - Fp)
                / (FLiso * BL + (Math.PI * V / (state[iLL] * state[iLL] * state[iLL])) * FCiso * BC);

        result[iAL] = p * (inputL(state, t) - state[iAL]);
        result[iAC] = p * (inputC(state, t) - state[iAC]);
    }

    model.registerDrift(drift);

    that.LL = function (state, t) { return state[iLL]; };
    that.LC = LC;
    that.AL = function (state, t) { return state[iAL]; };
    that.AC = function (state, t) { return state[iAC]; };

    return that;
};

