TestCase("SimControls", {
    setUp: function () {
        self.params = { 
            paramA: { label: "param A", defaultVal: 1, minVal: -10, maxVal: 10 }, 
            paramB: { label: "param B", defaultVal: 2, minVal: -20, maxVal: 20 }, 
            paramC: { label: "param C", defaultVal: 4, minVal: -40, maxVal: 40 }, 
            paramD: { label: "param D", defaultVal: 8, minVal: -80, maxVal: 80 },
            paramE: { label: "param E", defaultVal: 16, minVal: -160, maxVal: 160 } // not shown 
        };
        self.layout = [
            ['A Heading', ['paramA', 'paramB']],
            ['A Second Heading', ['paramC', 'paramD']],
        ];
        self.panel = document.createElement('div');
        self.controls = simcontrols.controls(
            self.panel, self.params, self.layout);
        this.section0 = self.panel.childNodes[0];
        this.section1 = self.panel.childNodes[1];
        this.paramTable0 = this.section0.childNodes[1];
        this.paramTable1 = this.section1.childNodes[1];
        this.table0Row0 = this.paramTable0.childNodes[0];
        this.table0Row1 = this.paramTable0.childNodes[1];
        this.table1Row0 = this.paramTable1.childNodes[0];
        this.table1Row1 = this.paramTable1.childNodes[1];
        this.editParamA = this.table0Row0.childNodes[1].childNodes[0];
        this.editParamB = this.table0Row1.childNodes[1].childNodes[0];
        this.editParamC = this.table1Row0.childNodes[1].childNodes[0];
        this.editParamD = this.table1Row1.childNodes[1].childNodes[0];
        this.errorParamA = this.table0Row0.childNodes[2];
        this.errorParamB = this.table0Row1.childNodes[2];
        this.errorParamC = this.table1Row0.childNodes[2];
        this.errorParamD = this.table1Row1.childNodes[2];
    },

    'test should create two sections' : function () {
        assertEquals(2, self.panel.childNodes.length);
    },

    'test first child of section should be the heading' : function () {
        var heading0 = this.section0.childNodes[0];
        assertEquals('A Heading', heading0.innerHTML);
        assertEquals('H3', heading0.tagName);

        var heading1 = this.section1.childNodes[0];
        assertEquals('A Second Heading', heading1.innerHTML);
        assertEquals('H3', heading1.tagName);
    },

    'test second child of section should be a table of parameters' : 
        function () {

        assertEquals('TABLE', this.paramTable0.tagName);

        assertEquals('TR', this.table0Row0.tagName);

        assertEquals('TD', this.table0Row0.childNodes[0].tagName);
        assertEquals('param A', this.table0Row0.childNodes[0].innerHTML);
        assertEquals('TD', this.table0Row0.childNodes[1].tagName);
        assertEquals('TD', this.errorParamA.tagName);
        assertEquals('', this.errorParamA.innerHTML);

        assertEquals('TABLE', this.paramTable0.tagName);

        assertEquals('TR', this.table1Row1.tagName);

        assertEquals('TD', this.table1Row1.childNodes[0].tagName);
        assertEquals('param D', this.table1Row1.childNodes[0].innerHTML);

        assertEquals('INPUT', this.editParamA.tagName);
        assertEquals('INPUT', this.editParamB.tagName);
        assertEquals('INPUT', this.editParamC.tagName);
        assertEquals('INPUT', this.editParamD.tagName);
    },

    'test controls should start out with default values' : function () {
        assertEquals(1, self.controls.values.paramA);
        assertEquals(2, self.controls.values.paramB);
        assertEquals(4, self.controls.values.paramC);
        assertEquals(8, self.controls.values.paramD);
        assertEquals(16, self.controls.values.paramE);
    },

    'test input boxes should match controls' : function () {
        assertEquals(self.controls.values.paramA, +this.editParamA.value);
        assertEquals(self.controls.values.paramB, +this.editParamB.value);
        assertEquals(self.controls.values.paramC, +this.editParamC.value);
        assertEquals(self.controls.values.paramD, +this.editParamD.value);
    },

    editValue: function (editBox, newValue) {
        // simulate a user change
        editBox.value = newValue;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true); // event type,bubbling,cancelable
        editBox.dispatchEvent(evt);
    },

    'test entering valid value should change value and clear error' : function () {
        this.editValue(this.editParamB, '1.25');
        assertSame(1.25, self.controls.values.paramB);
        assertEquals('', this.errorParamB.innerHTML);
    },

    'test entering invalid value should use default and give error' : function () {
        this.editValue(this.editParamC, -123);
        assertSame(-40, self.controls.values.paramC);
        assertNotEquals('', this.errorParamC.innerHTML);
    }
});


TestCase("SimControlsValidator", {
    setUp: function () {
        this.param = { defaultVal:2, minVal:-8, maxVal:13 };
    },

    'test should return valid values with no error' : function () {
        var result = simcontrols.defaultValidator(this.param, '4');
        assertSame(4, result.value);
        assertEquals('', result.error);
    },

    'test should return default value if not a finite number' : function () {
        var result = simcontrols.defaultValidator(this.param, 'Infinity');
        assertEquals(2, result.value);
        assertEquals('Unrecognized entry; using default of 2', result.error);
    },

    'test should return min value if less than minVal' : function () {
        var result = simcontrols.defaultValidator(this.param, '-12');
        assertEquals(-8, result.value);
        assertEquals('Value too low; using minimum value of -8', result.error);
    },

    'test should return max value if greater than maxVal' : function () {
        var result = simcontrols.defaultValidator(this.param, '15');
        assertEquals(13, result.value);
        assertEquals('Value too high; using maximum value of 13', result.error);
    }
})
