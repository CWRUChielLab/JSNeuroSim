TestCase("SimControls", {
    setUp: function () {
        self.params = { 
            paramA:{ label: "param A" }, 
            paramB:{ label: "param B" }, 
            paramC:{ label: "param C" }, 
            paramD:{ label: "param D" } 
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

    'test second child of section should be a table of parameters' : function () {
        var paramTable0 = this.section0.childNodes[1];
        assertEquals('TABLE', paramTable0.tagName);

        var table0Row0 = paramTable0.childNodes[0];
        assertEquals('TR', table0Row0.tagName);

        assertEquals('TD', table0Row0.childNodes[0].tagName);
        assertEquals('param A', table0Row0.childNodes[0].innerHTML);
        assertEquals('TD', table0Row0.childNodes[1].tagName);
        assertEquals('INPUT', table0Row0.childNodes[1].childNodes[0].tagName);

        var paramTable1 = this.section1.childNodes[1];
        assertEquals('TABLE', paramTable0.tagName);

        var table1Row1 = paramTable1.childNodes[1];
        assertEquals('TR', table1Row1.tagName);

        assertEquals('TD', table1Row1.childNodes[0].tagName);
        assertEquals('param D', table1Row1.childNodes[0].innerHTML);
    },
});
