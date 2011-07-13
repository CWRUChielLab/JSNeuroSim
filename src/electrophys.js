var electrophys = {};

electrophys.passiveMembrane = function (model, options) {
    var C = options.C;
    var g_leak = options.g_leak;
    var E_leak = options.E_leak;
    var currents = [];

    var iV = model.addStateVar(0);
    
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
