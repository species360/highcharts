import Highcharts from '../../parts/Globals.js';
import onSeriesAfterRender from '../../parts-gantt/heat-indicator.src.js';
var Series = Highcharts.Series;

// Add heat indicator functionality to Highcharts Series.
Highcharts.addEvent(Series, 'afterRender', onSeriesAfterRender);
