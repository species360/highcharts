var today = +Date.now(),
    minutes = 60 * 1000,
    hours = 60 * minutes,
    days = 24 * hours;

var information = {
    events: {
        loading: {
            color: '#395627'
        },
        ladenVoyage: {
            color: '#558139'
        },
        unloading: {
            color: '#aad091'
        },
        ballastVoyage: {
            color: '#c6dfb6'
        }
    },
    vessels: [{
        name: 'Vessel 1',
        utilized: 95,
        idle: 10,
        trips: [{
            name: 'Contract 1',
            startPort: 'USGLS',
            midPort: 'BEZEE',
            endPort: 'USCP6',
            start: today + days,
            loading: 1 * days + 2 * hours + 45 * minutes,
            ladenVoyage: 21 * days,
            unloading: 1 * days + 5 * hours,
            ballastVoyage: 14 * days
        }, {
            name: 'Contract 2',
            startPort: 'USGLS',
            midPort: 'BEZEE',
            endPort: 'USCP6',
            start: today + 50 * days,
            loading: 2 * days,
            ladenVoyage: 10 * days,
            unloading: 1 * days,
            ballastVoyage: 5 * days
        }, {
            name: 'Contract 5',
            startPort: 'USGLS',
            midPort: 'BEZEE',
            endPort: 'USCP6',
            start: today + 75 * days,
            loading: 1 * days + 2 * hours + 45 * minutes,
            ladenVoyage: 21 * days,
            unloading: 1 * days + 5 * hours,
            ballastVoyage: 14 * days
        }]
    }, {
        name: 'Vessel 2',
        utilized: 75,
        idle: 23,
        trips: [{
            name: 'Contract 3',
            startPort: 'USGLS',
            midPort: 'BEZEE',
            endPort: 'USCP6',
            start: today - 5 * days,
            loading: 1 * days + 2 * hours + 45 * minutes,
            ladenVoyage: 21 * days,
            unloading: 1 * days + 5 * hours,
            ballastVoyage: 14 * days,
            earliestPossibleReturn: (today - 5 * days) + 30 * days
        }, {
            name: 'Contract 4',
            startPort: 'USGLS',
            midPort: 'BEZEE',
            endPort: 'USCP6',
            start: today + 45 * days,
            loading: 2 * days,
            ladenVoyage: 10 * days,
            unloading: 1 * days,
            ballastVoyage: 5 * days
        }]
    }]
};
var find = Highcharts.find,
    dragGuideBox = {
        default: {
            'stroke-width': 1,
            'stroke-dasharray': '5, 5',
            stroke: '#888',
            fill: 'rgba(0, 0, 0, 0.1)',
            zIndex: 900
        },
        error: {
            fill: 'rgba(255, 0, 0, 0.2)'
        }
    };

/**
 * NB! Copied from modules/wordcloud.src.js
 * isRectanglesIntersecting - Detects if there is a collision between two
 *     rectangles.
 *
 * @param  {object} r1 First rectangle.
 * @param  {object} r2 Second rectangle.
 * @return {boolean} Returns true if the rectangles overlap.
 */
var isRectanglesIntersecting = function isRectanglesIntersecting(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
};

/**
 * Collision detection.
 * @param {Object} point The positions of the new point.
 * @param {Object} chart The chart if there is a collision.
 * @returns {Boolean} Returns true if the point is colliding.
 */
var isColliding = function (point, chart) {
    var r1 = {
            left: point.start,
            right: point.end,
            top: point.y,
            bottom: point.y
        },
        // Only check for collision with points lying on the same series as the
        // new point.
        series = find(chart.series, function (series) {
            return series.index === point.y;
        }),
        data = series && series.data || [];
    return !!find(data, function (p) {
        var r2 = {
            left: p.start,
            right: p.end,
            top: p.y,
            bottom: p.y
        };

        return p.trip === point.trip ? false : isRectanglesIntersecting(r1, r2);
    });
};

// --- Task resize functionality ----

var showResizeHandles = function (point) {
    var renderer = point.series.chart.renderer,
        series = point.series,
        xAxis = series.xAxis,
        addEvent = Highcharts.addEvent,
        handleAttrs = {
            strokeWidth: 2,
            fill: 'rgba(170, 170, 170, 0.6)'
        },
        handleCss = {
            stroke: '#444',
            cursor: 'ew-resize'
        },
        getHandlePath = function (left) {
            var bBox = point.graphic.getBBox(),
                edge = left ? bBox.x : bBox.x + bBox.width;
            return [
                // Top wick
                'M', edge, bBox.y,
                'L', edge, bBox.y + bBox.height / 3,
                // Box
                'L', edge + 2, bBox.y + bBox.height / 3,
                'L', edge + 2, bBox.y + bBox.height / 3 * 2,
                'L', edge - 2, bBox.y + bBox.height / 3 * 2,
                'L', edge - 2, bBox.y + bBox.height / 3,
                'L', edge, bBox.y + bBox.height / 3,
                // Bottom wick
                'M', edge, bBox.y + bBox.height / 3 * 2,
                'L', edge, bBox.y + bBox.height,
                // Grip lines
                'M', edge - 1, bBox.y + bBox.height / 12 * 5,
                'L', edge + 1, bBox.y + bBox.height / 12 * 5,
                'M', edge - 1, bBox.y + bBox.height / 2,
                'L', edge + 1, bBox.y + bBox.height / 2,
                'M', edge - 1, bBox.y + bBox.height / 12 * 7,
                'L', edge + 1, bBox.y + bBox.height / 12 * 7
            ];
        },
        resizeCollides = function (point, newX) {
            var points = point.series.points,
                i = points.length,
                within = function (p, x) {
                    return x >= p.x - 1 && x <= p.x2 + 1;
                };
            while (i--) {
                if (points[i] !== point && within(points[i], newX)) {
                    return true;
                }
            }
            return false;
        };

    if (
        !point.isDragResizing && // Don't show again if we already resizing
        !point.isAnimating && // Don't show if we are animating the point
        !point.overResizeHandle // Don't show again if we are hovering handle
    ) {
        point.isDragResizing = true;
        if (!point.dragResizeHandles) {
            // Create handles if they don't exist
            point.dragResizeHandles = renderer.g().add(point.graphic.parentGroup);
            point.rightResizeHandle = renderer.path(getHandlePath())
                .attr(handleAttrs).css(handleCss).add(point.dragResizeHandles);
            point.leftResizeHandle = renderer.path(getHandlePath(true))
                .attr(handleAttrs).css(handleCss).add(point.dragResizeHandles);

            // Add event handlers
            [point.rightResizeHandle, point.leftResizeHandle].forEach(
                function (handle, i) {
                    addEvent(handle.element, 'mouseover', function () {
                        point.overResizeHandle = true;
                    });
                    addEvent(handle.element, 'mouseout', function () {
                        delete point.overResizeHandle;
                    });
                    addEvent(handle.element, 'mousedown', function (e) {
                        var linkedPoint = series.points.find(function (p) {
                            return i ?
                                // Left handle - look for point with x2 === x
                                p.x2 === point.x :
                                // Right handle
                                p.x === point.x2;
                        });
                        point.resizeStart = {
                            pageX: e.pageX,
                            plotX: Math.round(xAxis.toPixels(
                                i ? point.x : point.x2,
                                true
                            )),
                            handle: i ? 'left' : 'right',
                            translateX: handle.attr('translateX'),
                            linkedPoint: linkedPoint
                        };
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
            addEvent(series.chart.container, 'mousemove', function (e) {
                var resizeData = point.resizeStart;
                if (resizeData) {
                    var newPoint = Highcharts.extend({}, point.options),
                        newLinkedPoint,
                        deltaX = e.pageX - resizeData.pageX,
                        newX = Math.round(xAxis.toValue(
                            resizeData.plotX + deltaX, true
                        )),
                        left = resizeData.handle === 'left',
                        handle = point[
                            left ? 'leftResizeHandle' : 'rightResizeHandle'
                        ];

                    if (resizeCollides(point, newX)) {
                        delete point.resizeStart;
                        return;
                    }

                    newPoint[left ? 'x' : 'x2'] =
                        newPoint[left ? 'start' : 'end'] =
                        newX;

                    point.update(newPoint, true, false);

                    if (resizeData.linkedPoint) {
                        newLinkedPoint = Highcharts.extend(
                            {}, resizeData.linkedPoint.options
                        );
                        newLinkedPoint[left ? 'x2' : 'x'] =
                            newLinkedPoint[left ? 'end' : 'start'] =
                            newX;
                        resizeData.linkedPoint.update(
                            newLinkedPoint, true, false
                        );
                    }

                    handle.translate(resizeData.translateX + deltaX, 0);
                }
            });
            addEvent(document, 'mouseup', function () {
                delete point.resizeStart;
            });
        } else {
            // Update handle location if already exists
            point.rightResizeHandle.attr({
                d: getHandlePath()
            }).translate(0, 0);
            point.leftResizeHandle.attr({
                d: getHandlePath(true)
            }).translate(0, 0);
        }
        point.dragResizeHandles.show();
    }
};

var hideResizeHandles = function (point) {
    if (point.dragResizeHandles) {
        point.dragResizeHandles.hide();
        delete point.isDragResizing;
    }
};

var onMouseOver = function () {
    var point = this;
    showResizeHandles(point);
};

var onMouseOut = function () {
    var point = this;
    hideResizeHandles(point);
};

// --- Drag/drop functionality ----

Highcharts.Chart.prototype.callbacks.push(function (chart) {
    var addEvent = Highcharts.addEvent,
        container = chart.container;

    function mouseDown() {
        var guideWidth,
            guideX = Infinity,
            group = {
                start: Number.MAX_SAFE_INTEGER,
                end: Number.MIN_SAFE_INTEGER,
                y: 0
            },
            bBox;

        if (chart.hoverPoint) {
            // Store point to move
            chart.dragPoint = chart.hoverPoint;
            group.y = chart.dragPoint.y;

            // Draw guide box
            bBox = chart.dragPoint.graphic.getBBox();
            guideWidth = chart.dragPoint.series.points.reduce(
                function (acc, cur) {
                    var bb;
                    if (cur.trip === chart.dragPoint.trip) {
                        bb = cur.graphic.getBBox();
                        guideX = Math.min(guideX, bb.x);
                        acc += bb.width;
                        // Collect start and end of group.
                        group.start = Math.min(cur.start, group.start);
                        group.end = Math.max(cur.end, group.end);
                    }
                    return acc;
                }, 0
            );
            chart.dragPoint.group = group;

            chart.dragGuideBox = chart.renderer.rect(
                chart.plotLeft + guideX,
                chart.plotTop + bBox.y,
                guideWidth,
                bBox.height
            ).attr(dragGuideBox.default).add();
        }
    }

    function mouseMove(e) {
        var dragPoint = chart.dragPoint,
            group = dragPoint && dragPoint.group,
            xAxis,
            yAxis,
            xDelta,
            isDragPointColliding,
            deltaX,
            deltaY;
        if (dragPoint) {
            xAxis = dragPoint.series.xAxis;
            yAxis = dragPoint.series.yAxis;
            // No tooltip while dragging
            e.preventDefault();

            // Update new positions
            dragPoint.dragPageX = dragPoint.dragPageX || e.pageX;
            dragPoint.dragPageY = dragPoint.dragPageY || e.pageY;
            deltaX = e.pageX - dragPoint.dragPageX;
            deltaY = e.pageY - dragPoint.dragPageY;
            dragPoint.newX = Math.round(xAxis.toValue(
                dragPoint.plotX + deltaX, true
            ));
            dragPoint.newY = Math.round(yAxis.toValue(
                dragPoint.plotY + deltaY, true
            ));
            xDelta = dragPoint.newX - dragPoint.start;

            // Check if the new position of the dragged point is colliding.
            dragPoint.isColliding =
            isDragPointColliding = isColliding({
                start: group.start + xDelta,
                end: group.end + xDelta,
                y: dragPoint.newY,
                trip: dragPoint.trip
            }, chart);

            // Move guide box
            chart.dragGuideBox
                .translate(deltaX, deltaY)
                .attr(
                    isDragPointColliding ?
                    dragGuideBox.error :
                    dragGuideBox.default
                );
        }
    }

    function drop() {
        var newSeries,
            newPoints,
            deltaX,
            dragPoint = chart.dragPoint,
            trip,
            oldSeries,
            reset = function () {
                // Remove guide box
                if (chart.dragGuideBox) {
                    chart.dragGuideBox.destroy();
                    delete chart.dragGuideBox;
                }
                // Remove stored dragging references on point in case we update
                // instead of replacing.
                if (dragPoint) {
                    delete dragPoint.dragPageX;
                    delete dragPoint.dragPageY;
                    delete dragPoint.newX;
                    delete dragPoint.newY;
                }
                // Remove chart reference to current dragging point
                delete chart.dragPoint;
            };

        if (
            dragPoint &&
            dragPoint.newX !== undefined &&
            dragPoint.newY !== undefined &&
            !dragPoint.isColliding
        ) {
            // Collect some values from dragPoint
            oldSeries = dragPoint.series;
            trip = dragPoint.trip;

            // Find series the points should belong to.
            // Series have y value as ID, making it easy to map between them.
            newSeries = chart.get(dragPoint.newY);
            if (!newSeries) {
                reset();
                return;
            }

            // Define options for the the new points
            deltaX = dragPoint.newX - dragPoint.start;
            newPoints = oldSeries.points.reduce(function (acc, cur) {
                // Only add points from the same series with the same trip name
                if (cur.trip === trip) {
                    var point = {
                        start: cur.start + deltaX,
                        end: cur.end + deltaX,
                        y: dragPoint.newY,
                        oldPoint: cur
                    };
                    // Copy over data from old point
                    [
                        'color', 'vessel', 'trip', 'type', 'startPort',
                        'endPort', 'name', 'indicator'
                    ].forEach(function (prop) {
                        point[prop] = cur[prop];
                    });
                    acc.push(point);
                }
                return acc;
            }, []);

            // Hide resize lines if on
            hideResizeHandles(chart.dragPoint);

            // Update the point
            if (newSeries !== oldSeries) {
                newPoints.forEach(function (newPoint) {
                    var oldPoint = newPoint.oldPoint;

                    if (oldPoint.heatIndicator) {
                        oldPoint.heatIndicator =
                            oldPoint.heatIndicator.destroy();
                    }
                    if (oldPoint.indicatorObj) {
                        oldPoint.indicatorObj =
                            oldPoint.indicatorObj.destroy();
                    }

                    newPoint.oldPoint = oldPoint = oldPoint.remove(false);
                    delete newPoint.oldPoint;
                    newSeries.addPoint(newPoint, false);
                });

                // Workaround to add new points to series.points, as this is not
                // done automatically by addPoint.
                newSeries.generatePoints();
            } else {
                // Use point.update if series is the same.
                // Make sure we don't allow resize handles on hover while
                // animating, so add a flag for that.
                newPoints.forEach(function (newPoint) {
                    var old = newPoint.oldPoint;
                    delete newPoint.oldPoint;
                    old.isAnimating = true;
                    old.update(newPoint, true, {
                        duration: 300
                    });
                    // Complete runs too fast (bug?), so set a timeout instead
                    setTimeout(function () {
                        delete old.isAnimating;
                    }, 310);
                });
            }

            // Call chart redraw to update the visual positions of the points
            // and indicators
            newSeries.chart.redraw();
            setTimeout(function () {
                chart.hoverPoint.firePointEvent('mouseOver');
            }, 310);
        }

        // Always reset on mouseup
        reset();
    }

    // Add events
    addEvent(container, 'mousedown', mouseDown);
    addEvent(container, 'mousemove', mouseMove);
    addEvent(document, 'mouseup', drop);
    addEvent(container, 'mouseleave', drop);
});

// ---- end drag/drop ----

var getPoint = function (params) {
    var start = params.start,
        style = params.style,
        trip = params.trip,
        type = params.type,
        vessel = params.vessel,
        duration = trip[type],
        indicator,
        earliestPossibleReturn = trip.earliestPossibleReturn,
        end = start + duration,
        startPort = type === 'ladenVoyage' ?
            trip.startPort : (
                type === 'ballastVoyage' ? trip.midPort : null
            ),
        endPort = type === 'ladenVoyage' ?
            trip.midPort : (
                type === 'ballastVoyage' ? trip.endPort : null
            );

    indicator = (
        (start < earliestPossibleReturn && earliestPossibleReturn < end) ?
        {
            enabled: true,
            x: earliestPossibleReturn - start
        } :
        undefined
    );

    return {
        start: start,
        end: end,
        color: style.color,
        vessel: vessel.name,
        indicator: indicator,
        trip: trip.name,
        y: params.y,
        type: type,
        startPort: startPort,
        endPort: endPort,
        name: trip.name
    };
};

var getGroupFromTrip = function (trip, groups, vessel, y) {
    var start = trip.start,
        events = Object.keys(groups);

    return events.reduce(function (group, key) {
        var point = getPoint({
            start: group.end,
            style: groups[key],
            trip: trip,
            type: key,
            vessel: vessel,
            y: y
        });

        // Update start for the next iteration
        group.end = point.end;

        // Add the point
        group.points.push(point);
        return group;
    }, {
        end: start,
        points: [],
        start: start,
        y: y
    });
};

var getSeriesFromInformation = function (info) {
    var events = info.events,
        vessels = info.vessels;
    return vessels.reduce(function (series, vessel, i) {
        var info = vessel.trips.reduce(function (result, trip) {
            var group = getGroupFromTrip(trip, events, vessel, i);

            result.groups.push(group);
            result.data = result.data.concat(group.points);
            return result;
        }, {
            data: [],
            groups: []
        });

        series.push({
            name: vessel.name,
            data: info.data,
            id: i
        });
        return series;
    }, []);
};

var getCategoryFromIdleTime = function (utilized, idle) {
    var thresholds = {
            25: 'bad',
            50: 'ok',
            75: 'good',
            100: 'great'
        },
        threshold = find(Object.keys(thresholds), function (threshold) {
            return utilized < +threshold;
        }),
        className = thresholds[threshold];
    return [
        '<span class="info-span ' + className + '">',
        '    <span class="utilized">' + utilized + '%</span><br/>',
        '    <span>t: ' + idle + ' days</span>',
        '</span>'
    ].join('\n');
};

var leftLabelFormat = function () {
    if (this.point.type === 'ladenVoyage' || this.point.type === 'ballastVoyage') {
        return this.point.startPort;
    }
};

var centerLabelFormat = function () {
    if (this.point.type === 'ladenVoyage') {
        return ' ' + this.point.name + ' ';
    }
};

var rightLabelFormat = function () {
    if (this.point.type === 'ladenVoyage' || this.point.type === 'ballastVoyage') {
        return this.point.endPort;
    }
};

var gridColumnFormatterSeriesName = function () {
    var chart = this.chart,
        series = chart.get(this.value);
    return series.name;
};

var gridColumnFormatterSeriesIdle = function () {
    var chart = this.chart,
        series = chart.get(this.value),
        xAxis = series.xAxis,
        total = xAxis.max - xAxis.min,
        idle = series.idle || 0,
        used = total - idle,
        percentage = Math.round((100 / total) * used),
        idleDays = Math.round(idle / days);
    return getCategoryFromIdleTime(percentage, idleDays);
};

var tooltipFormatter = function () {
    var point = this.point,
        trip = point.trip,
        series = point.series,
        dateFormat = function (date) {
            var format = '%e. %b';
            return Highcharts.dateFormat(format, date);
        },
        pointFormat = {
            'loading': function (point) {
                return [
                    '<b>Loading</b><br/>',
                    'Start: ' + dateFormat(point.start) + '<br/>',
                    'End: ' + dateFormat(point.end) + '<br/>'
                ].join('');
            },
            'ladenVoyage': function (point) {
                return [
                    '<b>Laden Voyage</b><br/>',
                    'Start: (' + point.startPort + ') ' + dateFormat(point.start) + '<br/>',
                    'End: (' + point.endPort + ') ' + dateFormat(point.end) + '<br/>'
                ].join('');
            },
            'unloading': function (point) {
                return [
                    '<b>Unloading</b><br/>',
                    'Start: ' + dateFormat(point.start) + '<br/>',
                    'End: ' + dateFormat(point.end) + '<br/>'
                ].join('');
            },
            'ballastVoyage': function (point) {
                var indicator = point.indicatorObj;
                return [
                    '<b>Ballast Voyage</b><br/>',
                    'Start: (' + point.startPort + ') ' + dateFormat(point.start) + '<br/>',
                    'End: (' + point.endPort + ') ' + dateFormat(point.end) + '<br/>',
                    indicator ? 'EPR: ' + dateFormat(indicator.x) : ''
                ].join('');
            }
        };
    return [
        '<b>' + trip + ' - ' + series.name + '</b><br/>',
        pointFormat[point.type] ? pointFormat[point.type](point) : ''
    ].join('');
};

var xAxisMin = today - (10 * days),
    xAxisMax = xAxisMin + 90 * days;

Highcharts.ganttChart('container', {
    plotOptions: {
        series: {
            heatIndicator: {
                enabled: true,
                filter: function (indicator) {
                    var start = indicator.start,
                        end = indicator.end,
                        idleTime = end - start;
                    return idleTime > (10 * days);
                }
            },
            stickyTracking: true,
            point: {
                events: {
                    mouseOver: onMouseOver,
                    mouseOut: onMouseOut
                }
            },
            cursor: 'move',
            borderRadius: 0,
            borderWidth: 0,
            pointPadding: 0,
            dataLabels: [{
                enabled: true,
                labelrank: 1,
                formatter: leftLabelFormat,
                align: 'left',
                style: {
                    fontSize: '8px'
                }
            }, {
                enabled: true,
                labelrank: 2,
                formatter: centerLabelFormat,
                align: 'center',
                borderWidth: 1,
                padding: 3,
                style: {
                    fontSize: '10px'
                }
            }, {
                enabled: true,
                labelrank: 1,
                formatter: rightLabelFormat,
                align: 'right',
                style: {
                    fontSize: '8px'
                }
            }]
        }
    },
    legend: {
        enabled: false
    },
    rangeSelector: {
        enabled: true,
        selected: 1
    },
    scrollbar: {
        enabled: true
    },
    series: getSeriesFromInformation(information),
    tooltip: {
        formatter: tooltipFormatter
    },
    xAxis: [{
        type: 'datetime',
        currentDateIndicator: true,
        grid: false,
        labels: {
            format: undefined
        },
        min: xAxisMin,
        max: xAxisMax,
        tickInterval: undefined
    }],
    yAxis: [{
        type: 'grid',
        maxPadding: 0,
        staticScale: 100,
        labels: {
            useHTML: true
        },
        grid: {
            columns: [{
                labels: {
                    formatter: gridColumnFormatterSeriesName
                }
            }, {
                labels: {
                    formatter: gridColumnFormatterSeriesIdle
                }
            }]
        }
    }]
});
