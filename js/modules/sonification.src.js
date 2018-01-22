/**
 * Sonification module
 *
 * (c) 2010-2017 Highsoft AS
 * Author: Øystein Moseng
 *
 * License: www.highcharts.com/license
 */
'use strict';
import H from '../parts/Globals.js';
import '../parts/Utilities.js';
import '../parts/Chart.js';
import '../parts/Series.js';
import '../parts/Point.js';
import '../parts/Tooltip.js';

var merge = H.merge,
	doc = H.win.document;

H.audio = new (H.win.AudioContext || H.win.webkitAudioContext)();
H.supportsSonification = !!(
	H.audio && H.audio.createOscillator && H.audio.createGain
);

// Highlight a point (show tooltip and display hover state). Returns the
// highlighted point.
// Stolen from Accessibility module
H.Point.prototype.highlight = H.Point.prototype.highlight || function () {
	var chart = this.series.chart;
	if (!this.isNull) {
		this.onMouseOver(); // Show the hover marker and tooltip
	} else {
		if (chart.tooltip) {
			chart.tooltip.hide(0);
		}
		// Don't call blur on the element, as it messes up the chart div's focus
	}
	chart.highlightedPoint = this;
	return this;
};


// Add the sonification status live area when a chart is created
H.Chart.prototype.callbacks.push(function (chart) {
	if (chart.screenReaderRegion) {
		chart.sonificationStatus = doc.createElement('p');
		chart.sonificationStatus.setAttribute(
			'class', 'highcharts-sonification-status'
		);
		chart.sonificationStatus.setAttribute('aria-live', 'assertive');
		chart.screenReaderRegion.appendChild(chart.sonificationStatus);
	}
});


// Set the current playing status of the sonification
H.Chart.prototype.setSonificationStatus = function (statusMsg) {
	if (this.sonificationStatus) {
		this.sonificationStatus.innerHTML = statusMsg;
	}
};


// Hide this series from screen readers
H.Series.prototype.hideFromScreenReaders = function () {
	var firstPointEl = (
			this.points &&
			this.points.length &&
			this.points[0].graphic &&
			this.points[0].graphic.element
		),
		seriesEl = (
			firstPointEl &&
			firstPointEl.parentNode || this.graph &&
			this.graph.element || this.group &&
			this.group.element
		);
	this.pointParentElement = seriesEl;
	if (seriesEl) {
		seriesEl.setAttribute('aria-hidden', 'true');
	}
};


// Sonify a series
H.Series.prototype.sonify = function (callback) {
	var options = merge(
		this.chart.options.sonification,
		this.options.sonification
	);

	if (
		this.isSonifying ||
		options.enabled === false ||
		!H.supportsSonification
	) {
		return;
	}

	var gainNode = H.audio.createGain(),
		// We fall back to mono if panning is not supported (Safari)
		panNode = H.audio.createStereoPanner && H.audio.createStereoPanner(),
		oscillator = H.audio.createOscillator(),
		series = this,
		numPoints = series.points.length,
		valueToFreq = function (val) {
			var valMin = series.yAxis && series.yAxis.dataMin || series.dataMin,
				valMax = series.yAxis && series.yAxis.dataMax || series.dataMax,
				freqStep = (options.maxFrequency - options.minFrequency) /
					(valMax - valMin);
			return options.minFrequency + (val - valMin) * freqStep;
		},
		timePerPoint = Math.min(
			options.maxDuration / numPoints, 
			options.maxPointDuration
		),
		timePerX = options.maxDuration /
			(
				(series.xAxis.dataMax || Math.max.apply(null, series.xData)) -
				(series.xAxis.dataMin || Math.min.apply(null, series.xData))
			) / 1000,
		maxPointsNum = options.maxDuration / options.minPointDuration,
		pointSkip = 1,
		panStep = 2 * options.stereoRange / numPoints,
		startTime,
		endTime,
		queuePlay = function (freq, vol, start, end, pan) {
			// Fade in and out for this note
			if (
				options.endRampTime !== false &&
				options.startRampTime !== false
			) {
				gainNode.gain.setTargetAtTime(vol, start,
					end ? (end - start) * options.startRampTime : 0);
			}
			oscillator.frequency[
				options.smooth ?
				'linearRampToValueAtTime' : 'setValueAtTime'
			](freq,	start);
			if (end && options.endRampTime !== false) {
				gainNode.gain.setTargetAtTime(0, end,
					(end - start) * options.endRampTime);
			}
			if (options.stereo && panNode) {
				panNode.pan.setValueAtTime(pan, start);
			}
		};

	series.isSonifying = true;
	series.oscillator = oscillator;
	series.chart.setSonificationStatus('Playing ' + series.name);

	// Skip over points if we have too many
	// We might want to use data grouping here
	if (options.mode !== 'musical' && timePerPoint < options.minPointDuration) {
		pointSkip = Math.ceil(numPoints / maxPointsNum);
		timePerPoint = options.minPointDuration;
	}

	// Init audio nodes
	gainNode.gain.value = options.volume;
	oscillator.type = options.waveType;
	oscillator.frequency.value = 0;
	oscillator.connect(gainNode);
	if (panNode) {
		panNode.pan.value = -1;
		gainNode.connect(panNode);
		panNode.connect(H.audio.destination);
	} else {
		gainNode.connect(H.audio.destination);
	}

	// Remove from screen reader
	series.hideFromScreenReaders();

	// Play
	oscillator.start(H.audio.currentTime);
	series.sonifyTimeouts = [];
	for (var i = 0, point, pointOpts; i < numPoints; i += pointSkip) {
		point = this.points[i];
		if (point) {
			pointOpts = merge(options, point.options.sonification);
			if (options.mode === 'musical') {
				if (pointOpts.startTime !== undefined) {
					startTime = H.audio.currentTime + pointOpts.startTime;
					endTime = (
						pointOpts.duration && startTime + pointOpts.duration ||
						this.points[i + 1] &&
						this.points[i + 1].options.sonification &&
						H.audio.currentTime +
							this.points[i + 1].options.sonification.startTime ||
						startTime + timePerPoint / 1000
					);
				} else {
					// Start time not defined in musical mode, we set it from
					// x value. Duration is either specified in options or null
					// to continue until next point.
					startTime = H.audio.currentTime + (
						point.x -
							(
								series.xAxis.dataMin ||
								Math.min.apply(null, series.xData)
							) + 1
					) * timePerX;
					endTime = pointOpts.duration &&
						startTime + pointOpts.duration || null;
				}
			} else {
				startTime = H.audio.currentTime + i * timePerPoint / 1000;
				endTime = startTime + timePerPoint / 1000;
			}

			queuePlay(
				pointOpts.frequency || valueToFreq(point.y),
				pointOpts.volume,
				startTime,
				endTime,
				pointOpts.pan * options.stereoRange ||
					(-1 * options.stereoRange + panStep * i)
			);

			if (options.showCursor) {
				// Highlight this point at the time of sonifying
				series.sonifyTimeouts.push(setTimeout((function (point) {
					return function () {
						point.highlight();
					};
				}(point)), (startTime - H.audio.currentTime) * 1000));
			}
		}
	}

	// Set oscillator stop time
	oscillator.stop((endTime || startTime) + 1);

	// Destroy when oscillator stops
	oscillator.onended = function (e, enableCallback) {
		delete series.oscillator;
		delete series.sonifyTimeouts;
		delete series.isSonifying;
		series.chart.setSonificationStatus('');
		// Make visible to screen readers again
		series.pointParentElement.removeAttribute('aria-hidden');
		delete series.pointParentElement;
		// Do the callback if provided
		if (callback && enableCallback !== false) {
			callback.call(series);
		}
	};
};

// Start/stop sonification
H.Chart.prototype.sonify = function () {
	var options = this.options.sonification,
		chartIsSonifying = H.reduce(this.series, function (acc, cur) {
			return acc || cur.isSonifying;
		}, false);

	if (chartIsSonifying) {
		// Stop sonifying
		H.each(this.series, function (series) {
			if (series.oscillator) {
				var oldOnEnd = series.oscillator.onended;
				series.oscillator.onended = function () {
					oldOnEnd.call(this, null, false);
				};
				series.oscillator.stop();
			}
			if (series.sonifyTimeouts) {
				H.each(series.sonifyTimeouts, function (timeoutId) {
					clearTimeout(timeoutId);
				});
				delete series.sonifyTimeouts;
			}
		});
	} else if (this.series.length) {
		// Start sonifying
		this.setSonificationStatus(''); // Init the status live region
		if (options.polyphonic) {
			H.each(this.series, function (series) {
				series.sonify();
			});
		} else {
			this.series[0].sonify(function sonifyNext() {
				var newSeries = this.chart.series[this.index + 1];
				if (newSeries && !this.chart.isCancellingSonify) {
					setTimeout(function () {
						newSeries.sonify(sonifyNext);
					}, H.pick(
						newSeries.options.sonification &&
						newSeries.options.sonification.seriesDelay,
						options.seriesDelay
					));
				}
			});
		}
	}
};

// Default sonification options, also available per series
H.setOptions({
	sonification: {
		seriesDelay: 1500, // Delay between series in ms
		maxDuration: 5000, // In ms
		minPointDuration: 30, // In ms
		maxPointDuration: 300, // In ms
		minFrequency: 100,
		maxFrequency: 2400,
		startRampTime: false, // Volume ramp for each note (factor of duration)
		endRampTime: false, // Keep going indefinitely
		waveType: 'sine',
		polyphonic: false, // Play all series simultaneously
		// mode: 'musical' to make point playtime correspond to x val, or use
		// point.sonification.duration and .startTime
		mode: 'normal',
		smooth: false, // Glide to next note frequency
		stereo: true, // Note: Panning might not be accessible to mono users
		stereoRange: 0.8, // Factor to apply to stereo range
		volume: 0.8, // Factor
		showCursor: true // Highlight points as we go
	}
});
/*
	point: {
		sonification: {
			pan: 0, // -1 to 1. Requires stereo:true. stereoRange factor applies
			duration: 0, // Requires mode: 'musical'
			startTime: 0, // Requires mode: 'musical' - start offset in sec
			volume: 0,
			frequency: 0
		}
	}
*/

// Add option to export menu to sonify the chart
H.getOptions().exporting.buttons.contextButton.menuItems.push({
	text: 'Sonify chart',
	onclick: function () {
		this.sonify();
	}
});
