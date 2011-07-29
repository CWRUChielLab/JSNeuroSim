var ode = {};

ode.eulerStep = function (dy, y, t, dt) {
    var dy1 = dy(y, t);
    var y1 = new Array(y.length);
        
    for (var i = 0; i < y.length; ++i) {
        y1[i] = y[i] + dy1[i]*dt;
    }

    return y1;
};

ode.rk4Step = function (dy, y, t, dt) {
    var i, l = y.length,
        y1, y2, y3, y4, yn;
    
    y1 = dy(y, t); 
    j = l;
    while (j > 0) {
        --j;
        y1[j] = y[j] + 0.5 * dt * y1[j];
    }
    
    y2 = dy(y1, t + dt/2); 
    j = l;
    while (j > 0) {
        --j;
        y2[j] = y[j] + 0.5 * dt * y2[j];
    }
    
    y3 = dy(y2, t + dt/2); 
    j = l;
    while (j > 0) {
        --j;
        y3[j] = y[j] + dt * y3[j];
    }
    
    y4 = dy(y3, t + dt); 
    j = l;
    while (j > 0) {
        --j;
        y4[j] = y1[j]/3 + y2[j]*2/3 + y3[j]/3 + dt * y4[j]/6 - y[j]/3;
    }

    return y4;
};

ode.integrate = function (options) {
    var t = options.tMin, 
        y = options.y0,
        maxStep = options.tMaxStep || (options.tMax - options.tMin)/1024,
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
        y = ode.rk4Step(options.drift, y, t, maxStep);
        t += maxStep; 
        
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

