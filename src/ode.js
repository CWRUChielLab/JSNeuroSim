var ode = {};

ode.eulerStep = function (dy, y, t, dt) {
    var dy1 = dy(y, t);
    var y1 = new Array(y.length);
        
    for (var i = 0; i < y.length; ++i) {
        y1[i] = y[i] + dy1[i]*dt;
    }

    return y1;
};

ode.integrate = function (options) {
    var t = options.tMin, 
        y = options.y0,
        yj,
        result = { t : [], y : [] },
        ndim = options.y0.length,
        d;
    
    result.t.push(t);
    for (d = 0; d < ndim; ++d) {        
        result.y.push([]);
        result.y[d].push(y[d]);
    }

    while (t < options.tMax) {        
        y = ode.eulerStep(options.drift, y, t, options.tMaxStep);
        t += options.tMaxStep; 
        
        if (options.jump) {
            yj = options.jump(y, t);
            if (yj) {
                y = yj;
            }
        }

        result.t.push(t);
        d = ndim;
        while (d > 0) {        
            --d;
            result.y[d].push(y[d]);
        }
    }

    return result;
};

