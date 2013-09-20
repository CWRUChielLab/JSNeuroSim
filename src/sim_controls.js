/*jslint browser: true */
var simcontrols = (function () {
    "use strict";

    function defaultValidator(param, value) {
        var units = param.units === undefined ? '' : ' ' + param.units;

        if (!isFinite(value)) {
            return { 
                value: param.defaultVal, 
                error: 'Unrecognized entry; using default of '
                    + String(param.defaultVal) + units
            };
        } else if (+value < param.minVal) {
            return { 
                value: param.minVal, 
                error: 'Value too low; using minimum value of '
                    + String(param.minVal) + units
            };
        } else if (+value > param.maxVal) {
            return { 
                value: param.maxVal, 
                error: 'Value too high; using maximum value of '
                    + String(param.maxVal) + units
            };
        } else {
            return { value: +value, error: '' };
        }
    }

    function controls(element, params, layout) {
        var i, section, heading, paramTable, j, paramName, paramRow, 
            paramLabel, paramInputCell, paramUnits,
            values, errorLabels = {}, textBoxes = {}, checkBoxes = {};

        // store the current value of each of the parameters
        values = {};
        for (i in params) {
            if (params.hasOwnProperty(i)) {                
                if (params[i].hasOwnProperty('checked')) {
                    if (params[i].checked) {
                        values[i] = params[i].checkedVal;
                    } else {
                        values[i] = params[i].uncheckedVal;
                    }
                } else {
                    values[i] = params[i].defaultVal;
                }
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
        
        function checkBoxChangeHandler(paramName) {
            return function () {
                if (checkBoxes[paramName].checked) {
                    values[paramName] = params[paramName].checkedVal;
                } else {
                    values[paramName] = params[paramName].uncheckedVal;
                }
            };
        }
        
        // create the controls
        for (i = 0; i < layout.length; i += 1) {
            section = document.createElement('div');
            section.className = 'simparamsection';
            element.appendChild(section);

            heading = document.createElement('h4');
            heading.innerHTML = layout[i][0];
            heading.className = 'simparamheading';
            section.appendChild(heading);

            paramTable = document.createElement('table');
            section.appendChild(paramTable);

            for (j = 0; j < layout[i][1].length; j += 1) {
                paramName = layout[i][1][j];

                paramRow = document.createElement('tr');
                paramTable.appendChild(paramRow);
                
                paramLabel = document.createElement('td');
                paramLabel.innerHTML = params[paramName].label;
                paramLabel.className = 'simparamlabel';
                paramRow.appendChild(paramLabel);
                
                paramInputCell = document.createElement('td');
                paramRow.appendChild(paramInputCell);

                if (params[paramName].hasOwnProperty('checked')) {

                    checkBoxes[paramName] = document.createElement('input');
                    checkBoxes[paramName].type = 'checkbox';
                    checkBoxes[paramName].checked = params[paramName].checked;
                    checkBoxes[paramName].addEventListener('change',
                        checkBoxChangeHandler(paramName), false);
                    checkBoxes[paramName].className = 'simparamcheck';
                    paramInputCell.appendChild(checkBoxes[paramName]);

                } else {

                    textBoxes[paramName] = document.createElement('input');
                    textBoxes[paramName].value = params[paramName].defaultVal;
                    textBoxes[paramName].addEventListener('change', 
                        textBoxChangeHandler(paramName), false);
                    textBoxes[paramName].className = 'simparaminput';
                    paramInputCell.appendChild(textBoxes[paramName]);

                }

                paramUnits = document.createElement('td');
                if (params[paramName].units) {
                    paramUnits.innerHTML = params[paramName].units;
                }
                paramUnits.className = 'simparamunits';
                paramRow.appendChild(paramUnits);

                errorLabels[paramName] = document.createElement('td');
                errorLabels[paramName].className = 'simparamerror';
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

            for (i in checkBoxes) {
                if (checkBoxes.hasOwnProperty(i)) {                
                    checkBoxChangeHandler(i)();
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

