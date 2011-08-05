var simcontrols = {};

simcontrols.controls = function (element, params, layout) {
    // create the controls
    for (var i = 0; i < layout.length; ++i) {
        var section = document.createElement('div');
        element.appendChild(section);

        var heading = document.createElement('h3');
        heading.innerHTML = layout[i][0];
        section.appendChild(heading);

        var paramTable = document.createElement('table');
        section.appendChild(paramTable);

        for (var j = 0; j < layout[i][1].length; ++j) {
            var paramRow = document.createElement('tr');
            paramTable.appendChild(paramRow);
            
            var paramLabel = document.createElement('td');
            paramLabel.innerHTML = params[layout[i][1][j]].label;
            paramRow.appendChild(paramLabel);
            
            var paramInputCell = document.createElement('td');
            paramRow.appendChild(paramInputCell);

            var paramInput = document.createElement('input');
            paramInputCell.appendChild(paramInput);
        }
    }
};
