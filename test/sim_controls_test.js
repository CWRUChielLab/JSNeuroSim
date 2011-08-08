TestCase("SimControls", {
    setUp: function () {
        self.params = { 
            paramA: { label: "param A", default: 1 }, 
            paramB: { label: "param B", default: 2 }, 
            paramC: { label: "param C", default: 4 }, 
            paramD: { label: "param D", default: 8 },
            paramE: { label: "param E", default: 16 } // not shown 
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

    'test changing control should change values' : function () {
        // simulate a user change
        this.editParamB.value = 1.25;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true); // event type,bubbling,cancelable
        this.editParamB.dispatchEvent(evt);

        assertEquals(1.25, self.controls.values.paramB);
    }
});
