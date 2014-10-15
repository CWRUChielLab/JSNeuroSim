var graphJqplot = {};

// default options for jqPlots
graphJqplot.defaultOptions = function (params) {
    return {
        grid: {
            shadow: false,
        },
        legend: {
            placement: 'outside',
        },
        cursor: {
            show: true,
            zoom: true,
            looseZoom: false,
            followMouse: true,
            useAxesFormatters: false,
            showVerticalLine: true,
            showTooltipDataPosition: true,
            tooltipFormatString: "%s: %.2f, %.2f"
        },
        captureRightClick: true,
        axes: {
            xaxis: {
                min: 0,
                max: params.totalDuration_ms,
                tickOptions: {formatString: '%.2f'},
            },
        },
        axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
        },
        seriesDefaults: {
            showMarker: false,
            lineWidth: 1,
            shadow: false,
        },
    };
};


// determine the index of the data point in the first
// series nearest (in the x-coordinate) the cursor
graphJqplot.nearestPoint = function (datapos, plot) {
    var low, mid, high, nearest_point,
        low_x, mid_x, high_x, cursor_x;

    cursor_x = datapos.xaxis;
    nearest_point = -1;
    low = 0;
    high = plot.data[0].length-1;

    // perform a binary search
    while (high - low > 1) {
        mid = Math.round((low+high)/2);
        mid_x = plot.data[0][mid][0];
        if (mid_x <= cursor_x)
            low = mid;
        else
            high = mid;
    }

    // identify the nearest point
    if (plot.data[0][low][0] == cursor_x) {
        high = low;
        nearest_point = high;
    } else {
        low_x = plot.data[0][low][0];
        high_x = plot.data[0][high][0];
        if (Math.abs(low_x - cursor_x) < Math.abs(high_x - cursor_x))
            nearest_point = low;
        else
            nearest_point = high;   
    }

    return nearest_point;
};


// when the user right-clicks, append to the data table the values
// from each series for the data points nearest (in the x-coordinate)
// the cursor with the value of the x-coordinate
graphJqplot.bindDataCapture = function (plotID, dataTable, dataTableTitle, xTitle) {
    $(plotID).bind('jqplotRightClick',
        function (ev, gridpos, datapos, neighbor, plot) {
            var caption, row, cell, i,
                nearest_point, nearest_point_x, nearest_point_y;

            // determine which point is closest to the cursor
            nearest_point = graphJqplot.nearestPoint(datapos, plot);

            // if the table has no contents, unhide the table,
            // create a caption, and create a heading
            if (!dataTable.firstChild) {
                // unhide the table
                dataTable.style.display = 'table';

                // create a table title
                caption = document.createElement('caption');
                caption.className = 'datatablecaption';
                caption.innerHTML = dataTableTitle;
                dataTable.appendChild(caption);

                // create a heading row
                row = document.createElement('tr');
                dataTable.appendChild(row);

                cell = document.createElement('td');
                cell.className = 'datatableheading';
                cell.innerHTML = xTitle;
                row.appendChild(cell);

                for (i=0; i<plot.data.length; i++) {
                    cell = document.createElement('td');
                    cell.className = 'datatableheading';
                    cell.innerHTML = plot.series[i].label;
                    row.appendChild(cell);
                }
            }

            // create a new table row for the captured data point
            row = document.createElement('tr');
            dataTable.appendChild(row);

            // add the x-coordinate value to the table
            nearest_point_x = plot.data[0][nearest_point][0];
            cell = document.createElement('td');
            cell.innerHTML = Math.round(nearest_point_x*1000)/1000;
            row.appendChild(cell);

            // add each series value to the table
            for (i=0; i<plot.data.length; i++) {
                nearest_point_y = plot.data[i][nearest_point][1];
                cell = document.createElement('td');
                cell.innerHTML = Math.round(nearest_point_y*1000)/1000;
                row.appendChild(cell);
            }
        }
    );
};


// when the user right-clicks, append to the data table the values
// from each series for the data points nearest (in the x-coordinate)
// the cursor with the value of the x-coordinate
graphJqplot.bindBarChartDataCapture = function (plotID, chartData, dataTable, dataTableTitle, xTitle, yTitle) {
    console.log(chartData);
    $(plotID).bind('jqplotRightClick',
        function (ev, seriesIndex, pointIndex, data) {
            var caption, row, cell, i;

            // if the table has no contents, unhide the table,
            // create a caption, and create a heading
            if (!dataTable.firstChild) {
                // unhide the table
                dataTable.style.display = 'table';

                // create a table title
                caption = document.createElement('caption');
                caption.className = 'datatablecaption';
                caption.innerHTML = dataTableTitle;
                dataTable.appendChild(caption);

                // create a heading row
                row = document.createElement('tr');
                dataTable.appendChild(row);

                cell = document.createElement('td');
                cell.className = 'datatableheading';
                cell.innerHTML = xTitle;
                row.appendChild(cell);

                cell = document.createElement('td');
                cell.className = 'datatableheading';
                cell.innerHTML = yTitle;
                row.appendChild(cell);
            }

            // create a new table row for the captured data point
            row = document.createElement('tr');
            dataTable.appendChild(row);

            // add the x-coordinate value to the table
            cell = document.createElement('td');
            cell.innerHTML = Math.round(chartData[data.pointIndex][0]);
            row.appendChild(cell);

            // add each series value to the table
            cell = document.createElement('td');
            cell.innerHTML = chartData[data.pointIndex][1];
            row.appendChild(cell);
        }
    );
};


// create a cursor tooltip that displays the values from each series
// for the data points nearest (in the x-coordinate) the cursor with
// the value of the x-coordinate
graphJqplot.bindCursorTooltip = function (plotID, xTitle, xUnits, yUnits) {
    $(plotID).bind('jqplotMouseMove',
        function (ev, gridpos, datapos, neighbor, plot) {
            var tooltipHTML, i,
                nearest_point, nearest_point_x, nearest_point_y;
            
            // determine which point is closest to the cursor
            nearest_point = graphJqplot.nearestPoint(datapos, plot);

            // clear the tooltip
            tooltipHTML = '';

            // add the x-coordinate value to the tooltip
            nearest_point_x = plot.data[0][nearest_point][0];
            tooltipHTML = tooltipHTML + xTitle + ": " + Math.round(nearest_point_x*1000)/1000 + " " + xUnits;

            // add each series value to the tooltip
            for (i=0; i<plot.data.length; i++) {
                nearest_point_y = plot.data[i][nearest_point][1];
                tooltipHTML = tooltipHTML + "<br/>" + plot.series[i].label + ": " + Math.round(nearest_point_y*1000)/1000 + " " + yUnits;
            }

            // display the tooltip
            $(".jqplot-cursor-tooltip").html(tooltipHTML);
        }
    );
};


Array.prototype.min = function () {
    return this.reduce(function (p, v) {
        return ( p < v ? p : v );
    });
}

Array.prototype.max = function () {
    return this.reduce(function (p, v) {
        return ( p > v ? p : v );
    });
}


// Format data for the histogram plotter
graphJqplot.histFormat = function (binNumber, data) {
    var maxVal, minVal, binRange, binStepSize, binStepMin, binStepMax;
    var histData = new Array;
    
    maxVal = data.max();
    minVal = data.min();
    binRange = maxVal - minVal;
    binStepSize = Math.max(binRange / binNumber, 1);
    binStepMin = minVal;
    binStepMax = minVal + binStepSize;	
    for (var i = 0; i <= binNumber; i++ ) {
        histData[i] = [binStepMin, 0];
        for (var j = 0; j < data.length; j++) {
            if (binStepMin == minVal && data[j] == minVal) {
                histData[i][1]++;
            }
            if (data[j] <= binStepMax && data[j] > binStepMin) {
                histData[i][1]++;
            }		
        }			
        binStepMin += binStepSize;
        binStepMax += binStepSize;
    }
    return histData;
}

