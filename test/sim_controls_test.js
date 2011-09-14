TestCase("SimControls", {
    setUp: function () {
        this.params = { 
            paramA: { label: "param A", units: 'km', 
                defaultVal: 1, minVal: -10, maxVal: 10 }, 
            paramB: { label: "param B", units: 'm', 
                defaultVal: 2, minVal: -20, maxVal: 20 }, 
            paramC: { label: "param C", /* units: 'cm', */
                defaultVal: 4, minVal: -40, maxVal: 40 }, 
            paramD: { label: "param D", units: 'mm', 
                defaultVal: 8, minVal: -80, maxVal: 80 },
            paramE: { label: "param E", units: '\u00B5m', 
                defaultVal: 16, minVal: -160, maxVal: 160 } // not shown 
        };
        this.layout = [
            ['A Heading', ['paramA', 'paramB']],
            ['A Second Heading', ['paramC', 'paramD']],
        ];
        this.panel = document.createElement('div');
        this.controls = simcontrols.controls(
            this.panel, this.params, this.layout);
        
        this.section0 = this.panel.childNodes[0];
        this.section1 = this.panel.childNodes[1];
        
        this.heading0 = this.section0.childNodes[0];
        this.heading1 = this.section1.childNodes[0];

        this.paramTable0 = this.section0.childNodes[1];
        this.paramTable1 = this.section1.childNodes[1];
        
        this.table0Row0 = this.paramTable0.childNodes[0];
        this.table0Row1 = this.paramTable0.childNodes[1];
        this.table1Row0 = this.paramTable1.childNodes[0];
        this.table1Row1 = this.paramTable1.childNodes[1];
        
        this.labelParamA = this.table0Row0.childNodes[0];
        this.labelParamB = this.table0Row1.childNodes[0];
        this.labelParamC = this.table1Row0.childNodes[0];
        this.labelParamD = this.table1Row1.childNodes[0];

        this.editParamA = this.table0Row0.childNodes[1].childNodes[0];
        this.editParamB = this.table0Row1.childNodes[1].childNodes[0];
        this.editParamC = this.table1Row0.childNodes[1].childNodes[0];
        this.editParamD = this.table1Row1.childNodes[1].childNodes[0];
        
        this.unitsParamA = this.table0Row0.childNodes[2];
        this.unitsParamB = this.table0Row1.childNodes[2];
        this.unitsParamC = this.table1Row0.childNodes[2];
        this.unitsParamD = this.table1Row1.childNodes[2];

        this.errorParamA = this.table0Row0.childNodes[3];
        this.errorParamB = this.table0Row1.childNodes[3];
        this.errorParamC = this.table1Row0.childNodes[3];
        this.errorParamD = this.table1Row1.childNodes[3];
    },

    'test should create two sections' : function () {
        assertEquals(2, this.panel.childNodes.length);
    },

    'test sections should have class simparamsection' : function () {
        assertEquals('simparamsection', this.section0.className);
        assertEquals('simparamsection', this.section1.className);
    },

    'test headings should have proper text' : function () {
        assertEquals('A Heading', this.heading0.innerHTML);
        assertEquals('A Second Heading', this.heading1.innerHTML);
    },

    'test headings should be h4 elements' : function () {
        assertEquals('H4', this.heading0.tagName);
        assertEquals('H4', this.heading1.tagName);
    },

    'test headings should have simparamheading class' : function () {
        assertEquals('simparamheading', this.heading0.className);
        assertEquals('simparamheading', this.heading1.className);
    },

    'test units should be table data items' : function () {
        assertEquals('TD', this.unitsParamA.tagName);
        assertEquals('TD', this.unitsParamB.tagName);
        assertEquals('TD', this.unitsParamC.tagName);
        assertEquals('TD', this.unitsParamD.tagName);
    },

    'test units should be listed' : function () {
        assertEquals('km', this.unitsParamA.innerHTML);
        assertEquals('m', this.unitsParamB.innerHTML);
        assertEquals('', this.unitsParamC.innerHTML);
        assertEquals('mm', this.unitsParamD.innerHTML);
    },

    'test row unitss should have class simparamunits' : function () {
        assertEquals('simparamunits', this.unitsParamA.className);
        assertEquals('simparamunits', this.unitsParamB.className);
        assertEquals('simparamunits', this.unitsParamC.className);
        assertEquals('simparamunits', this.unitsParamD.className);
    },

    'test second child of section should be a table of parameters' : 
        function () {

        assertEquals('TABLE', this.paramTable0.tagName);
        assertEquals(2, this.paramTable0.childNodes.length);
        assertEquals('TR', this.table0Row0.tagName);
        assertEquals('TR', this.table0Row1.tagName);
        assertEquals('TABLE', this.paramTable0.tagName);
        assertEquals(2, this.paramTable1.childNodes.length);
        assertEquals('TR', this.table1Row0.tagName);
        assertEquals('TR', this.table1Row1.tagName);
    },

    'test row labels should be td nodes' : function () {
        assertEquals('TD', this.labelParamA.tagName);
        assertEquals('TD', this.labelParamB.tagName);
        assertEquals('TD', this.labelParamC.tagName);
        assertEquals('TD', this.labelParamD.tagName);
    },

    'test row labels should have expected text' : function () {
        assertEquals('param A', this.labelParamA.innerHTML);
        assertEquals('param B', this.labelParamB.innerHTML);
        assertEquals('param C', this.labelParamC.innerHTML);
        assertEquals('param D', this.labelParamD.innerHTML);
    },

    'test row labels should have class simparamlabel' : function () {
        assertEquals('simparamlabel', this.labelParamA.className);
        assertEquals('simparamlabel', this.labelParamB.className);
        assertEquals('simparamlabel', this.labelParamC.className);
        assertEquals('simparamlabel', this.labelParamD.className);
    },

    'test error messages should initially be empty' : function () {
        assertEquals('', this.errorParamA.innerHTML);
        assertEquals('', this.errorParamB.innerHTML);
        assertEquals('', this.errorParamC.innerHTML);
        assertEquals('', this.errorParamD.innerHTML);
    },

    'test row errors should have class simparamerror' : function () {
        assertEquals('simparamerror', this.errorParamA.className);
        assertEquals('simparamerror', this.errorParamB.className);
        assertEquals('simparamerror', this.errorParamC.className);
        assertEquals('simparamerror', this.errorParamD.className);
    },

    'test edit boxes should be input nodes inside td nodes' : function () {
        assertEquals('INPUT', this.editParamA.tagName);
        assertEquals('INPUT', this.editParamB.tagName);
        assertEquals('INPUT', this.editParamC.tagName);
        assertEquals('INPUT', this.editParamD.tagName);

        assertEquals('TD', this.editParamA.parentNode.tagName);
        assertEquals('TD', this.editParamB.parentNode.tagName);
        assertEquals('TD', this.editParamC.parentNode.tagName);
        assertEquals('TD', this.editParamD.parentNode.tagName);
    },

    'test input boxes should have simparaminput class' : function () {
        assertEquals('simparaminput', this.editParamA.className);
        assertEquals('simparaminput', this.editParamB.className);
        assertEquals('simparaminput', this.editParamC.className);
        assertEquals('simparaminput', this.editParamD.className);
    },

    'test controls should start out with default values' : function () {
        assertEquals(1, this.controls.values.paramA);
        assertEquals(2, this.controls.values.paramB);
        assertEquals(4, this.controls.values.paramC);
        assertEquals(8, this.controls.values.paramD);
        assertEquals(16, this.controls.values.paramE);
    },

    'test input boxes should match controls' : function () {
        assertEquals(this.controls.values.paramA, +this.editParamA.value);
        assertEquals(this.controls.values.paramB, +this.editParamB.value);
        assertEquals(this.controls.values.paramC, +this.editParamC.value);
        assertEquals(this.controls.values.paramD, +this.editParamD.value);
    },

    editValue: function (editBox, newValue) {
        // simulate a user change
        editBox.value = newValue;
        var evt = document.createEvent("Event");
        evt.initEvent("change", true, true); 
        editBox.dispatchEvent(evt);
    },

    'test entering valid value should change value and clear error' 
        : function () {
        this.editValue(this.editParamB, '1.25');
        assertSame(1.25, this.controls.values.paramB);
        assertEquals('', this.errorParamB.innerHTML);
    },

    'test entering invalid value should use default and give error' 
        : function () {
        this.editValue(this.editParamC, -123);
        assertSame(-40, this.controls.values.paramC);
        assertNotEquals('', this.errorParamC.innerHTML);
    },

    'test entering a value should not create an error until a change event' 
        : function () {
        
        this.editParamC.value = -123;
        assertSame(2, this.controls.values.paramB);
        assertEquals('', this.errorParamC.innerHTML);
    },

    'test triggerRead should force read of all controls' 
        : function () {
        
        this.editParamC.value = -123;
        this.controls.triggerRead();
        assertSame(-40, this.controls.values.paramC);
        assertNotEquals('', this.errorParamC.innerHTML);
    }
});


TestCase("SimControlsValidator", {
    setUp: function () {
        this.param = { 
            defaultVal: 2, minVal: -8, maxVal: 13, units: 'foozles' 
        };
        this.param_nounits = { 
            defaultVal: 2, minVal: -8, maxVal: 13
        };
    },

    'test should return valid values with no error' : function () {
        var result = simcontrols.defaultValidator(this.param, '4');
        assertSame(4, result.value);
        assertEquals('', result.error);
    },

    'test should return default value if not a finite number' : function () {
        var result = simcontrols.defaultValidator(this.param, 'Infinity');
        assertEquals(2, result.value);
        assertEquals('Unrecognized entry; using default of 2 foozles', 
            result.error);
    },

    'test should return min value if less than minVal' : function () {
        var result = simcontrols.defaultValidator(this.param, '-12');
        assertEquals(-8, result.value);
        assertEquals('Value too low; using minimum value of -8 foozles', 
            result.error);
    },

    'test should return max value if greater than maxVal' : function () {
        var result = simcontrols.defaultValidator(this.param, '15');
        assertEquals(13, result.value);
        assertEquals('Value too high; using maximum value of 13 foozles',
            result.error);
    },

    'test should skip units if none are given' : function () {
        var result_high, result_low, result_unknown;

        result_high = simcontrols.defaultValidator(this.param_nounits, '15');
        result_low = simcontrols.defaultValidator(this.param_nounits, '-15');
        result_unknown = simcontrols.defaultValidator(this.param_nounits, 
            'Q15');
        
        assertMatch(/13$/, result_high.error);
        assertMatch(/-8$/, result_low.error);
        assertMatch(/2$/, result_unknown.error);
    },
})
