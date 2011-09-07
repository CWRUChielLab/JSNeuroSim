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

    stub.hasCall = function (method, args) {
        var i, j;

        for (i = 0; i < calls.length; i += 1) {
            if (calls[i][0] === method) {
                if (args == undefined) {
                    return true;
                } else if (args.length === calls[i][1].length) {
                    console.log('name match');
                    for (j = 0; j < calls[i][1].length; j += 1) {
                            console.log(j);
                            console.log(args[j] + " vs. " + calls[i][1][j]);
                        if (args[j] !== calls[i][1][j]) {
                            break;
                        }
                    }

                    if (j == calls[i][1].length) {
                        return true;
                    }
                }
            }
        }

        return false;
    }; 

    return stub;
}
