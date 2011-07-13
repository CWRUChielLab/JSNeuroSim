var componentModel = {};

componentModel.componentModel = function () {
    var numStateVars = 0;
    var initialValues = [];
    var driftFunctions = [];
    var jumpFunctions = [];

    function addStateVar(initialValue) {
        initialValues.push(initialValue);
        return numStateVars++;
    }

    function drift(state, t) {
        var result = new Array(numStateVars),
            i, l;

        i = l = driftFunctions.length;
        while (i > 0) {
            --i;
            driftFunctions[i](result, state, t);
        }

        return result;
    }

    function jump(state, t) {
        var changed = false;

        i = l = jumpFunctions.length;
        while (i > 0) {
            --i;
            changed |= jumpFunctions[i](state, t);
        }

        if (changed) {
            return state;
        }
    }
        
    
    function integrate (options) { 
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
