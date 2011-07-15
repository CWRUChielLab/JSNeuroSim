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
}
