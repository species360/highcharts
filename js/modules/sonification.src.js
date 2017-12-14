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

var merge = H.merge;

H.audio = new (H.win.AudioContext || H.win.webkitAudioContext)();

// Highlight a point (show tooltip and display hover state). Returns the 
// highlighted point.
// Stolen from Accessibility module
H.Point.prototype.highlight = function () {
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


H.Series.prototype.sonify = function (callback) {
	var gainNode = H.audio.createGain(),
		panNode = H.audio.createStereoPanner(),
		oscillator = H.audio.createOscillator(),
		series = this,
		options = merge(
			this.chart.options.sonification,
			this.options.sonification
		),
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
		maxPointsNum = options.maxDuration / options.minPointDuration,
		pointSkip = 1,
		panStep = 2 * options.stereoRange / numPoints,
		startTime,
		endTime,
		queuePlay = function (freq, vol, start, end, pan) {
			// Fade in and out for this note
			gainNode.gain.setTargetAtTime(
				vol, 
				start, 
				(end - start) * options.startRampTime
			);
			oscillator.frequency[
				options.smooth ?
				'linearRampToValueAtTime' : 'setValueAtTime'
			](freq,	start);
			gainNode.gain.setTargetAtTime(
				0,
				end,
				(end - start) * options.endRampTime
			);
			if (options.stereo) {
				panNode.pan.setValueAtTime(pan, start);
			}
		};

	series.isSonifying = true;
	series.oscillator = oscillator;

	// Skip over points if we have too many
	// We might want to use data grouping here
	if (options.mode !== 'musical' && timePerPoint < options.minPointDuration) {
		pointSkip = Math.ceil(numPoints / maxPointsNum);
		timePerPoint = options.minPointDuration;
	}

	// Init audio nodes
	panNode.pan.value = -1;
	gainNode.gain.value = options.volume;
	oscillator.type = options.waveType;
	oscillator.frequency.value = 0;
	oscillator.connect(gainNode);
	gainNode.connect(panNode);
	panNode.connect(H.audio.destination);

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
					
				}
			} else {
				startTime = H.audio.currentTime + i * timePerPoint / 1000;
				endTime = startTime + timePerPoint / 1000;
			}

			console.log(startTime, endTime);

			queuePlay(
				pointOpts.frequency || valueToFreq(point.y),
				pointOpts.volume,
				startTime,
				endTime,
				pointOpts.pan * options.stereoRange ||
					(-1 * options.stereoRange + panStep * i)
			);

			series.sonifyTimeouts.push(setTimeout((function (point) {
				return function () {
					point.highlight();
				};
			}(point)), (startTime - H.audio.currentTime) * 1000));
		}
	}

	// Stop oscillator
	oscillator.stop(endTime + 1);

	oscillator.onended = function () {
		delete series.oscillator;
		delete series.sonifyTimeouts;
		series.isSonifying = false;
		callback.call(series);
	};
};

// Start/stop sonification
H.Chart.prototype.sonify = function () {
	var options = this.options.sonification,
		chartIsSonifying = H.reduce(this.series, function (acc, cur) {
			return acc || cur.isSonifying;
		}, false);

	if (chartIsSonifying) {
		H.each(this.series, function (series) {
			if (series.oscillator) {
				series.oscillator.onended = function () {};
				series.oscillator.stop();
				delete series.oscillator;
				series.isSonifying = false;
			}
			if (series.sonifyTimeouts) {
				H.each(series.sonifyTimeouts, function (timeoutId) {
					clearTimeout(timeoutId);
				});
				delete series.sonifyTimeouts;
			}
		});
	} else if (this.series[0]) {
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
};

// Default sonification options, also available per series
H.setOptions({
	sonification: {
		seriesDelay: 800, // Delay between series in ms
		maxDuration: 5000, // In ms
		minPointDuration: 30, // In ms
		maxPointDuration: 300, // In ms
		minFrequency: 100,
		maxFrequency: 2400,
		startRampTime: 1, // Volume ramp for each note (factor of duration)
		endRampTime: 1,
		waveType: 'sine',
		// mode: 'musical' to make point playtime correspond to x val, or use
		// point.sonification.duration and .startTime
		mode: 'normal',
		smooth: false, // Glide to next note frequency
		stereo: true, // Note: Panning might not be accessible to mono users
		stereoRange: 0.8, // Factor to apply to stereo range
		volume: 0.9
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
