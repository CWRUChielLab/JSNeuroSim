TestCase("Factorial", {
    "test should calculate proper factorials" : function () {
        assertEquals(720, stats.factorial(6));
        assertEquals(6, stats.factorial(3));
        assertEquals(1, stats.factorial(0));
    }
});


TestCase("randomBinomial", {
    setUp: function() {
        var randomResults = [ 0.9, 0.5, 0.4, 0.8, 0.7, 0.3, 0.6 ],
            nextResultIndex = 0;

        sinon.stub(Math, "random", function() {
            nextResultIndex += 1;
            return randomResults[nextResultIndex - 1];            
        });
    },

    tearDown: function() {
        Math.random.restore()
    },

    "test should generate expected binomial results with t=0" : function () {
        assertEquals(0, stats.randomBinomial(0, 0.9));
    },

    "test should generate expected binomial results with t=5, p=0.61" : function () {
        assertEquals(2, stats.randomBinomial(5, 0.61));
    },

    "test should generate expected binomial results with t=5, p=0.79" : function () {
        assertEquals(3, stats.randomBinomial(5, 0.79));
    },

    "test should generate expected binomial results with t=7, p=0.61" : function () {
        assertEquals(4, stats.randomBinomial(7, 0.6));
    }
});


TestCase("randomPoisson", {
    setUp: function() {
        var randomResults = [ 0.9, 0.8, 0.7, 0.6, 0.5 ],
            nextResultIndex = 0;

        sinon.stub(Math, "random", function() {
            nextResultIndex += 1;
            return randomResults[nextResultIndex - 1];            
        });
    },

    tearDown: function() {
        Math.random.restore()
    },

    "test should generate expected poisson results with mu=1.2" : function () {
        assertEquals(4, stats.randomPoisson(1.2));
    },

    "test should generate expected poisson results with mu=0.1" : function () {
        assertEquals(0, stats.randomPoisson(0.1));
    },

    "test should generate expected poisson results with mu=0.5" : function () {
        assertEquals(2, stats.randomPoisson(0.5));
    }
});


TestCase("randomNormal", {
    setUp: function() {
        var randomResults = [ 0.1, 0.9, 0.7, 0.6, 0.5 ],
            nextResultIndex = 0;

        sinon.stub(Math, "random", function() {
            nextResultIndex += 1;
            return randomResults[nextResultIndex - 1];            
        });
    },

    tearDown: function() {
        Math.random.restore()
    },

    "test should generate expected normal results with default parameters" : function () {
        assertClose(0.24507539570305903, stats.randomNormal());
    },

    "test should generate expected normal results with mu=3, sigma=2.5" : function () {
        assertClose(3.6126884892576476, stats.randomNormal(3, 2.5));
    },
});

