import Highcharts from '../parts/Globals.js';
import '../parts/Utilities.js';
import draw from '../mixins/draw-point.js';

var each = Highcharts.each,
    extend = Highcharts.extend,
    isFunction = function (x) {
        return typeof x === 'function';
    },
    isNumber = Highcharts.isNumber,
    merge = Highcharts.merge,
    reduce = Highcharts.reduce;

var defaultOptions = {
    color: {
        linearGradient: {
            x1: 0,
            x2: 1,
            y1: 0,
            y2: 0
        },
        stops: [
            [0, 'rgb(255, 255, 255)'],
            [0.8, 'rgb(255, 0, 0)']
        ]
    }
};

var HeatIndicator = function (params) {
    var indicator = this;
    indicator.init(params);
    return indicator;
};

HeatIndicator.prototype = {
    destroy: function () {
        var indicator = this,
            property;

        if (indicator.graphic) {
            indicator.graphic = indicator.graphic.destroy();
        }

        for (property in indicator) {
            indicator[property] = null;
            delete indicator[property];
        }

        return undefined;
    },
    draw: draw,
    getClassName: function () {
        return 'highcharts-heat-indicator';
    },
    init: function (params) {
        var indicator = this;

        // Set properties on the indicator.
        extend(indicator, {
            group: params.group,
            metrics: params.metrics,
            renderer: params.renderer,
            xAxis: params.xAxis,
            yAxis: params.yAxis
        });

        indicator.options = merge(defaultOptions, params.options);

        // Return a reference to the indicator.
        return indicator;
    },
    render: function () {
        var indicator = this,
            metrics = indicator.metrics,
            xAxis = indicator.xAxis,
            yAxis = indicator.yAxis,
            options = indicator.options,
            start = isNumber(indicator.start) ? indicator.start : xAxis.min,
            end = isNumber(indicator.end) ? indicator.end : xAxis.max,
            x1 = xAxis.translate(start, 0, 0, 0, 1),
            x2 = xAxis.translate(end, 0, 0, 0, 1),
            plotY = yAxis.translate(indicator.y, 0, 1, 0, 1),
            y1 = plotY,
            y2 = plotY + metrics.width / 2,
            animate = {},
            attr = {
                fill: options.color
            };

        // Animate only the width if the graphic is new.
        if (!indicator.graphic) {
            extend(attr, {
                x: x1,
                y: y1,
                width: 0,
                height: y2 - y1
            });
            animate.width = x2 - x1;
        } else {
            extend(animate, {
                x: x1,
                y: y1,
                width: x2 - x1,
                height: y2 - y1
            });
        }

        // Draw or destroy the graphic
        indicator.draw({
            animate: animate,
            attr: attr,
            css: undefined,
            group: indicator.group,
            renderer: indicator.renderer,
            shapeArgs: undefined,
            shapeType: 'rect'
        });
    },
    shouldDraw: function () {
        var indicator = this,
            options = indicator.options || {},
            filter = options.filter,
            start = indicator.start,
            end = indicator.end,
            y = indicator.y;

        return (
            options.enabled === true &&
            isNumber(start) &&
            isNumber(end) &&
            isNumber(y) &&
            start < end &&
            (isFunction(filter) ? filter(indicator) : true)
        );
    },
    update: function (params) {
        var indicator = this;
        extend(indicator, params);
        this.render();
    }
};

var calculateSeriesIdleTime = function (series) {
    var points = series.points
        .slice() // Make a copy before sorting.
        .sort(function (a, b) {
            return b.start - a.start;
        }),
        xAxis = series.xAxis,
        min = xAxis.min,
        firstPoint = points[points.length - 1].start,
        totalIdle = firstPoint > min ? firstPoint - min : 0,
        max = xAxis.max;

    reduce(points, function (next, current) {
        var start = current.end,
            end = next ? next.start : max,
            idle = (start < end) ? end - start : 0,
            visibleIdle = Math.min(end, max) - Math.max(start, min);
        visibleIdle = visibleIdle > 0 ? visibleIdle : 0;
        current.idle = idle;
        totalIdle += visibleIdle;
        return current;
    }, undefined);
    series.idle = totalIdle;
};

var onSeriesAfterRender = function () {
    var series = this,
        options = series.options && series.options.heatIndicator || {};

    // TODO Several modules are dependent upon this, it should be added as a
    // dependency somehow.
    calculateSeriesIdleTime(series);

    each(series.points, function (point) {
        // Get existing indicator from point, or create a new one.
        var heatIndicator = point.heatIndicator || new HeatIndicator({
            group: series.group,
            metrics: series.columnMetrics,
            xAxis: series.xAxis,
            yAxis: series.yAxis,
            options: options,
            renderer: series.chart.renderer
        });

        // Update the indicator. Rerenders the graphic with new values.
        heatIndicator.update({
            y: point.y,
            start: point.end,
            end: point.end + point.idle
        });

        // Set the resulting indicator on the point.
        point.heatIndicator = heatIndicator;
    });
};

export default onSeriesAfterRender;
