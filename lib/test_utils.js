function assertClose(expected, actual, rtol, atol) {
    var tol, failureMessage;
    rtol = rtol || 1e-9;
    atol = atol || 1e-9;
    tol = Math.max(atol, rtol*Math.abs(expected));
    failureMessage = "expected " + String(expected) + " +/- " 
        + String(tol) + " but was " + String(actual);
    assertTrue(failureMessage, Math.abs(Number(expected) - Number(actual)) <= tol);
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

    return stub;
}
