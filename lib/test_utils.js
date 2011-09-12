function assertClose(expected, actual, rtol, atol) {
    var tol, failureMessage;
    rtol = rtol || 1e-9;
    atol = atol || 1e-9;
    tol = Math.max(atol, rtol*Math.abs(expected));
    failureMessage = "expected " + String(expected) + " +/- " 
        + String(tol) + " but was " + String(actual);
    assertTrue(failureMessage, Math.abs(Number(expected) - Number(actual)) <= tol);
}

function deepCompare(a, b) {
    var name;

    if (a === b) {
        return true;
    } 
    
    if (typeof(a) !== 'object' || typeof(b) !== 'object') {
        return false;
    } 
    
    for (name in a) {
        if (a.hasOwnProperty(name) && !deepCompare(a[name], b[name])) {
            return false;
        }
    }

    for (name in b) {
        if (b.hasOwnProperty(name) && !a.hasOwnProperty(name)) {
            return false;
        }
    }

    return true;
}

function createStubbedObj(methods) {
    var stub = {}, 
        calls = [],
        i,l;

    i = l = methods.length;    
    while (i > 0) {
        --i;
        stub[methods[i]] = (function (methodName) { 
                return function () {
                    calls.push([methodName, 
                        Array.prototype.slice.call(arguments,0)]);
                };
            })(methods[i]);
    }
    
    stub.getCalls = function () { 
        return calls; 
    };

    stub.hasCall = function (method, args) {
        var i, j;

        for (i = 0; i < calls.length; i += 1) {
            if (calls[i][0] === method) {
                if (args == undefined) {
                    return true;
                } else {
                    if (deepCompare(args, calls[i][1])) {
                        return true;
                    }
                }
            }
        }

        return false;
    }; 

    return stub;
}
