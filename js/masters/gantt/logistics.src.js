import Highcharts from '../../parts/Globals.js';
import renderHeatIndicators from '../../parts-gantt/heat-indicator.js';
import renderEPRIndicators from '../../parts-gantt/epr-indicator.js';
var Series = Highcharts.Series;

// Add heat indicator functionality to Highcharts Series.
Highcharts.addEvent(Series, 'afterRender', function () {
    var series = this;
    renderEPRIndicators(series);
    renderHeatIndicators(series);
});
