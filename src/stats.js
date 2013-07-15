var stats = {};

stats.factorial = function (n) {    
    "use strict";
    var i = n,
        result = 1;

    while (i > 1) {
        result *= i;
        i -= 1;
    }

    return result;
};

stats.randomBinomial = function (t, p) {
    "use strict";
    var result = 0,
        i = t;

    while (i > 0) {
        i -= 1;
        if (Math.random() <= p) {
            result += 1;
        }
    }

    return result;
};

stats.randomPoisson = function (mu) {
    "use strict";
    // From Kunth's "The Art of Computer Programming" 3.4.1
    var result = -1,
        prod = 1,
        target = Math.exp(-mu);

    while (prod > target) {
        prod *= Math.random();
        result += 1;
    }

    return result;
};

stats.randomNormal = function (mu, sigma) {
    "use strict";
    // From Kunth's "The Art of Computer Programming" 3.4.1
    var u, v, x, 
        scale = 1.7155277699214135; // === sqrt(8/e)

    if (mu === undefined)
        mu = 0;
    if (sigma === undefined)
        sigma = 1;

    do {
        u = Math.random();
        v = Math.random();

        x = scale * (v - 0.5) / u;
    } while (x * x > -4 * Math.log(u));

    return mu + sigma * x;
};

