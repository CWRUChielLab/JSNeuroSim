/*jslint browser: true */
var simcontrols = {};

simcontrols.controls = function (element, params, layout) {
    "use strict";
    var i, section, heading, paramTable, j, paramName, paramRow, paramLabel,
        paramInputCell, values, textBoxes = {};

    // store the current value of each of the parameters
    values = {};
    for (i in params) {
        if (params.hasOwnProperty(i)) {
            values[i] = params[i].default;
        }
    }

    function textBoxChangeHandler(paramName) {
        return function () {
            values[paramName] = textBoxes[paramName].value;
        };
    }
    
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
            paramName = layout[i][1][j];

            paramRow = document.createElement('tr');
            paramTable.appendChild(paramRow);
            
            paramLabel = document.createElement('td');
            paramLabel.innerHTML = params[paramName].label;
            paramRow.appendChild(paramLabel);
            
            paramInputCell = document.createElement('td');
            paramRow.appendChild(paramInputCell);

            textBoxes[paramName] = document.createElement('input');
            textBoxes[paramName].value = params[paramName].default;
            textBoxes[paramName].addEventListener('change', 
                textBoxChangeHandler(paramName), false);
            paramInputCell.appendChild(textBoxes[paramName]);
        }
    }

    return { values: values };
};
