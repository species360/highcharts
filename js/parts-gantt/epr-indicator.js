import Highcharts from '../parts/Globals.js';
import '../parts/Utilities.js';
import draw from '../mixins/draw-point.js';

var each = Highcharts.each,
    extend = Highcharts.extend,
    isNumber = Highcharts.isNumber,
    merge = Highcharts.merge;

var defaultOptions = {
    color: 'rgb(255, 0, 0)',
    lineWidth: 1,
    dashstyle: 'dash'
};

var EPRIndicator = function (params) {
    var indicator = this;
    indicator.init(params);
    return indicator;
};

EPRIndicator.prototype = {
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
        return 'highcharts-eap-indicator';
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
            renderer = indicator.renderer,
            metrics = indicator.metrics,
            options = indicator.options,
            lineWidth = options.lineWidth,
            plotX = indicator.xAxis.translate(indicator.x, 0, 0, 0, 1),
            plotY = indicator.yAxis.translate(indicator.y, 0, 1, 0, 1),
            x1 = plotX,
            x2 = plotX,
            y1 = plotY - metrics.width / 2,
            y2 = plotY + metrics.width / 2,
            path = renderer.crispLine(['M', x1, y1, 'L', x2, y2], lineWidth),
            attr = {
                stroke: options.color,
                'stroke-width': lineWidth,
                dashstyle: options.dashstyle
            },
            animate = {};

        // Animate if the graphic is not new.
        if (!indicator.graphic) {
            attr.d = path;
        } else {
            animate.d = path;
        }

        // Draw or destroy the graphic
        indicator.draw({
            animate: animate,
            attr: attr,
            css: undefined,
            group: indicator.group,
            renderer: indicator.renderer,
            shapeArgs: undefined,
            shapeType: 'path'
        });
    },
    shouldDraw: function () {
        var indicator = this,
            x = indicator.x,
            y = indicator.y;

        return (indicator.enabled === true && isNumber(x) && isNumber(y));
    },
    update: function (params) {
        var indicator = this;
        extend(indicator, params);
        this.render();
    }
};

var renderEPRIndicators = function (series) {
    each(series.points, function (point) {
        var options = point.options && point.options.indicator || {},
            // point.options.indicator is copied to point.indicator, so we use
            // point.indicatorObj in stead.
            indicator = point.indicatorObj || new EPRIndicator({
                group: series.group,
                metrics: series.columnMetrics,
                xAxis: series.xAxis,
                yAxis: series.yAxis,
                renderer: series.chart.renderer
            });
        indicator.update({
            enabled: options.enabled,
            x: options.x ? point.start + options.x : point.start,
            y: point.y
        });

        point.indicatorObj = indicator;
    });
};

export default renderEPRIndicators;
