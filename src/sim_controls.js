/*jslint browser: true */
var simcontrols = (function () {
    "use strict";

    function defaultValidator(param, value) {
        if (!isFinite(value)) {
            return { 
                value: param.defaultVal, 
                error: 'Unrecognized entry; using default of '
                    + String(param.defaultVal) + ' '
                    + param.units
            };
        } else if (+value < param.minVal) {
            return { 
                value: param.minVal, 
                error: 'Value too low; using minimum value of '
                    + String(param.minVal) + ' '
                    + param.units
            };
        } else if (+value > param.maxVal) {
            return { 
                value: param.maxVal, 
                error: 'Value too high; using maximum value of '
                    + String(param.maxVal) + ' '
                    + param.units
            };
        } else {
            return { value: +value, error: '' };
        }
    }

    function controls(element, params, layout) {
        var i, section, heading, paramTable, j, paramName, paramRow, 
            paramLabel, paramInputCell, paramUnits,
            values, errorLabels = {}, textBoxes = {};

        // store the current value of each of the parameters
        values = {};
        for (i in params) {
            if (params.hasOwnProperty(i)) {                
                values[i] = params[i].defaultVal;
            }
        }

        function textBoxChangeHandler(paramName) {
            return function () {
                var result = defaultValidator(params[paramName], 
                        textBoxes[paramName].value);
                values[paramName] = result.value;
                errorLabels[paramName].innerHTML = result.error;
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
                textBoxes[paramName].value = params[paramName].defaultVal;
                textBoxes[paramName].addEventListener('change', 
                    textBoxChangeHandler(paramName), false);
                paramInputCell.appendChild(textBoxes[paramName]);

                paramUnits = document.createElement('td');
                paramUnits.innerHTML = params[paramName].units;
                paramRow.appendChild(paramUnits);

                errorLabels[paramName] = document.createElement('td');
                paramRow.appendChild(errorLabels[paramName]);
            }
        }

        function triggerRead() {
            var i;

            for (i in textBoxes) {
                if (textBoxes.hasOwnProperty(i)) {                
                    textBoxChangeHandler(i)();
                }
            }
        }

        return { 
            values: values,
            triggerRead: triggerRead
        };
    }

    return {
        controls: controls,
        defaultValidator: defaultValidator,
    };
}());

