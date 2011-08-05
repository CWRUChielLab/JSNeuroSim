/*jslint browser: true */
var simcontrols = {};

simcontrols.controls = function (element, params, layout) {
    "use strict";
    var i, section, heading, paramTable, j, paramRow, paramLabel,
        paramInputCell, paramInput;

    // create the controls
    for (i = 0; i < layout.length; i += 1) {
        section = document.createElement('div');
        element.appendChild(section);

        heading = document.createElement('h3');
        heading.innerHTML = layout[i][0];
        section.appendChild(heading);

        paramTable = document.createElement('table');
        section.appendChild(paramTable);

        for (j = 0; j < layout[i][1].length; j += 1) {
            paramRow = document.createElement('tr');
            paramTable.appendChild(paramRow);
            
            paramLabel = document.createElement('td');
            paramLabel.innerHTML = params[layout[i][1][j]].label;
            paramRow.appendChild(paramLabel);
            
            paramInputCell = document.createElement('td');
            paramRow.appendChild(paramInputCell);

            paramInput = document.createElement('input');
            paramInputCell.appendChild(paramInput);
        }
    }
};
