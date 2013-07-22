var ode = {};

ode.transpose = function (matrix) {
    "use strict";
    var i, j, result = [];

    for (j = 0; j < matrix[0].length; j++ ) {
        result[j] = [];
    }

    for (i = 0; i < matrix.length; i++ ) {
        for (j = 0; j < matrix[i].length; j++ ) {
            result[j][i] = matrix[i][j];
        }
    }

    return result;
};

ode.eulerStep = function (dy, y, t, dt) {
    "use strict";
    var dy1 = dy(y, t),
        y1 = new Array(y.length),
        i;
        
    for (i = 0; i < y.length; i += 1) {
        y1[i] = y[i] + dy1[i] * dt;
    }

    return y1;
};

ode.rk4Step = function (dy, y, t, dt) {
    "use strict";
    var i, l = y.length, j,
        y1, y2, y3, y4, yn;
    
    y1 = dy(y, t); 
    j = l;
    while (j > 0) {
        j -= 1;
        y1[j] = y[j] + 0.5 * dt * y1[j];
    }
    
    y2 = dy(y1, t + dt / 2); 
    j = l;
    while (j > 0) {
        j -= 1;
        y2[j] = y[j] + 0.5 * dt * y2[j];
    }
    
    y3 = dy(y2, t + dt / 2); 
    j = l;
    while (j > 0) {
        j -= 1;
        y3[j] = y[j] + dt * y3[j];
    }
    
    y4 = dy(y3, t + dt); 
    j = l;
    while (j > 0) {
        j -= 1;
        y4[j] = (y1[j] / 3 + y2[j] * 2 / 3 + y3[j] / 3 
                + dt * y4[j] / 6 - y[j] / 3);
    }

    return y4;
};


ode.rk45Step = function (dy, y, t, dt) {
    "use strict";
    // Constants from Numerical recipes, 3ed, p 913
    var c2 = 1 / 5, c3 = 3 / 10, c4 = 4 / 5, c5 = 8 / 9, c6 = 1, c7 = 1,
        a21 = 1 / 5, 
        a31 = 3 / 40, a32 = 9 / 40,
        a41 = 44 / 45, a42 = -56 / 15, a43 = 32 / 9,
        a51 = 19372 / 6561, a52 = -25360 / 2187, a53 = 64448 / 6561, 
        a54 = -212 / 729,
        a61 = 9017 / 3168, a62 = -355 / 33, a63 = 46732 / 5247, a64 = 49 / 176, 
        a65 = -5103 / 18656,
        a71 = 35 / 384, a73 = 500 / 1113, a74 = 125 / 192, a75 = -2187 / 6784, 
        a76 = 11 / 84,
        b1 = 5179 / 57600, b3 = 7571 / 16695, b4 = 393 / 640, 
        b5 = -92097 / 339200, b6 = 187 / 2100, b7 = 1 / 40,
        k1, k2, k3, k4, k5, k6, k7,
        y2 = [], y3 = [], y4 = [], y5 = [], y6 = [], y7 = [], delta = [], 
        i, n;

    n = y.length;

    k1 = dy(y, t);
    for (i = 0; i < n; i += 1) {
        k1[i] *= dt;
        y2[i] = y[i] + a21 * k1[i];
    }

    k2 = dy(y2, t + c2 * dt);
    for (i = 0; i < n; i += 1) {
        k2[i] *= dt;
        y3[i] = y[i] + a31 * k1[i] + a32 * k2[i];
    }

    k3 = dy(y3, t + c3 * dt);
    for (i = 0; i < n; i += 1) {
        k3[i] *= dt;
        y4[i] = y[i] + a41 * k1[i] + a42 * k2[i]  + a43 * k3[i];
    }

    k4 = dy(y4, t + c4 * dt);
    for (i = 0; i < n; i += 1) {
        k4[i] *= dt;
        y5[i] = y[i] + a51 * k1[i] + a52 * k2[i]  + a53 * k3[i] + a54 * k4[i];
    }

    k5 = dy(y5, t + c5 * dt);
    for (i = 0; i < n; i += 1) {
        k5[i] *= dt;
        y6[i] = y[i] + a61 * k1[i] + a62 * k2[i]  + a63 * k3[i] + a64 * k4[i] +
            a65 * k5[i];
    }

    k6 = dy(y6, t + c6 * dt);
    for (i = 0; i < n; i += 1) {
        k6[i] *= dt;
        y7[i] = y[i] + a71 * k1[i] /*+ a72 * k2[i] */  + a73 * k3[i] + 
            a74 * k4[i] + a75 * k5[i] + a76 * k6[i];
    }

    k7 = dy(y7, t + c7 * dt);
    for (i = 0; i < n; i += 1) {
        k7[i] *= dt;
        delta[i] = y7[i] - y[i] - (b1 * k1[i] + b3 * k3[i] + b4 * k4[i] +
            b5 * k5[i] + b6 * k6[i] + b7 * k7[i]);
    }
    
    return { y: y7, delta: delta };
};


ode.integrate = function (options) {
    "use strict";
    var t = options.tMin, y = options.y0,
        maxStep = options.tMaxStep || (options.tMax - options.tMin) / 1024,
        tMinOutput = (options.tMinOutput !== undefined ? 
            options.tMinOutput : maxStep / 50),
        atol = (options.atol !== undefined ?
            options.atol : 1e-5),
        yj,
        result = { t : [], y : [], terminationReason : 'reached tMax' },
        ndim = options.y0.length,
        d, h, h_new, step, delta_max, i,
        startTime = (new Date()).getTime();

    result.map = function (func) {
        var i, d, new_result = [];
        for (i = 0; i < this.t.length; i += 1) {
            var state = [];
            for (d = 0; d < ndim; d += 1) {
                state.push(this.y[d][i]);
            }
            new_result.push(func(state, this.t[i]));
        }
        return new_result;
    }
    
    result.mapOrderedPairs = function (func) {
        var i, d, new_result = [], yVar;

        yVar = func(this.y, this.t);
        
        for (i = 0; i < this.t.length; i += 1) {
            new_result.push([this.t[i], yVar[i]]);
        }

        return new_result;
    }

    result.t.push(t);
    for (d = 0; d < ndim; d += 1) {        
        result.y.push([]);
        result.y[d].push(y[d]);
    }

    h = maxStep;
addpoints: while (t < options.tMax) {
        while (true) {
            step = ode.rk45Step(options.drift, y, t, h);

            delta_max = Math.max(
                Math.max.apply(null, step.delta),
                -Math.min.apply(null, step.delta)
            );

            h_new = 0.95 * h * Math.pow(atol / delta_max, 1 / 5);

            if (h_new > 10 * h) {                
                h_new = 10 * h;
            } else if (h_new < h / 5 || isNaN(h_new)) {
                h_new = h / 5;
            }

            if (h_new > maxStep) {
                h_new = maxStep;
            }

            if (t + h_new === t) {
                result.terminationReason = 'Step size too small';
                break addpoints;
            }

            if (delta_max < atol) {
                t += h; 
                h = h_new;
                break;
            }

            h = h_new;
        }

        y = step.y;
        
        if (options.jump) {
            yj = options.jump(y, t);
            if (yj) {
                y = yj;
            }
        }

        if (t - result.t[result.t.length - 1] >= tMinOutput || 
                t >= options.tMax) {
            
            result.t.push(t);
            d = ndim;
            while (d > 0) {        
                d -= 1;
                result.y[d].push(y[d]);
            }
        }

        if (options.timeout && 
                (new Date()).getTime() - startTime >= options.timeout) {

            result.terminationReason = 'Timeout';
            break addpoints;
        }
    }

    result.t_f = t;
    result.y_f = y;

    return result;
};

