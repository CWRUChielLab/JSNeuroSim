var componentModel = {};

componentModel.componentModel = function () {
    "use strict";
    var numStateVars = 0,
        initialValues = [],
        driftFunctions = [],
        jumpFunctions = [];

    function addStateVar(initialValue) {
        initialValues.push(initialValue);
        numStateVars += 1;
        return numStateVars - 1;
    }

    function drift(state, t) {
        var result = [], 
            i, 
            l;

        result.length = numStateVars;

        i = l = driftFunctions.length;
        while (i > 0) {
            i -= 1;
            driftFunctions[i](result, state, t);
        }

        return result;
    }

    function jump(state, t) {
        var changed = false, i, l;

        i = l = jumpFunctions.length;
        while (i > 0) {
            i -= 1;
            changed = (jumpFunctions[i](state, t) || changed);
        }

        if (changed) {
            return state;
        }
    }
        
    
    function integrate(options) { 
        /*global ode: false */
        options.jump = jump;
        options.drift = drift;
        options.y0 = options.y0 || initialValues;

        return ode.integrate(options); 
    }

    return {
        addStateVar : addStateVar,
        numStateVars : function () { return numStateVars; },
        initialValues : function () { return initialValues.slice(0); },
        registerDrift : function (func) { driftFunctions.push(func); },
        drift : drift,
        registerJump : function (func) { jumpFunctions.push(func); },
        jump : jump,
        integrate : integrate
    };
};
