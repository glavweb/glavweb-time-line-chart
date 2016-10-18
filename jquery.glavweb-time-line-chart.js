/*
 * Glavweb Time Line Chart
 *
 * https://github.com/glavweb/glavweb-time-line-chart
 *
 * Copyright (C) GLAVWEB <info@glavweb.ru>
 *
 * @author Andrey Nilov <nilov@glavweb.ru>
 * @license The MIT License (MIT)
 */
(function($){

    /**
     * @constructor
     * 
     * @param {jQuery} $wrapper
     * @param {Object} data
     * @param {Object} options
     */
    function GlavwebTimeLineChart($wrapper, data, options) {
        this.wrapper = $wrapper;

        this.options = $.extend({
            timeBarSelector:           '.time-bar',
            legendBarSelector:         '.legend-bar',
            lineCommonGroupedByLegend: '.line-common-grouped-by-legend',
            step:              30,
            width:             800
        }, options);


        this.setData(data);
        this.setWidth(this.options.width);

        this.ui = {
            timeBar:   $wrapper.find(this.options.timeBarSelector),
            legendBar: $wrapper.find(this.options.legendBarSelector)
        };
    }

    /**
     * Set data
     *
     * @param {Object} data
     */
    GlavwebTimeLineChart.prototype.setData = function (data) {
        this.data = data;

        // Define properties
        var parsedData = this.parseData(this.data);

        this.lines      = parsedData[0];
        this.startTime  = parsedData[1];
        this.endTime    = parsedData[2];
        this.allMinutes = this.countMinutesBetweenDates(this.startTime, this.endTime);
        this.countLines = this.sizeObject(this.lines);
    };

    /**
     * Set width
     *
     * @param {number} width
     */
    GlavwebTimeLineChart.prototype.setWidth = function (width) {
        this.width = width;

        this.minuteWidth             = Math.round(parseFloat(width / this.getAllMinutes()) * 100) / 100;
        this.timeBarStepPositionLeft = 0;
    };

    /**
     * Get legends
     * 
     * @returns {Object}
     */
    GlavwebTimeLineChart.prototype.getLegends = function ()
    {
        return this.data.legends;
    };

    /**
     * Get lines
     * 
     * @returns {Object}
     */
    GlavwebTimeLineChart.prototype.getLines = function ()
    {
        return this.lines;
    };

    /**
     * Group line by legend
     *
     * @param {Array}  line
     * @param {string} orderDirection
     * @param {Object} legendWeight
     * @returns {Array}
     */
    GlavwebTimeLineChart.prototype.groupLineByLegend = function (line, orderDirection, legendWeight)
    {
        var self = this;
        
        // Get grouped object
        var groupByLegend = {};
        var legend, startTime, endTime, diffMinutes;
        $.each(line, function (key, timePie) {
            legend      = timePie[0];
            startTime   = timePie[1];
            endTime     = timePie[2];
            diffMinutes = self.countMinutesBetweenDates(startTime, endTime);

            if (groupByLegend[legend] === undefined) {
                groupByLegend[legend] = diffMinutes;
            } else {
                groupByLegend[legend] += diffMinutes;
            }
        });

        // Transform object to array
        var orderedArray = [];
        var item;
        for (item in groupByLegend) {
            orderedArray.push({
                'legend'       : item,
                'totalMinutes' : groupByLegend[item]
            });
        }

        // Sort array
        if (orderDirection !== undefined) {
            switch (orderDirection) {
                case 'desc':
                    orderedArray.sort(function(a, b) {
                        return b.totalMinutes - a.totalMinutes;
                    });

                    break;

                case 'asc':
                    orderedArray.sort(function(a, b) {
                        return a.totalMinutes - b.totalMinutes;
                    });

                    break;

                case 'legend':
                    orderedArray.sort(function(a, b) {
                        if (legendWeight[a.legend] === undefined) {
                            return 1;
                        }

                        if (legendWeight[b.legend] === undefined) {
                            return -1;
                        }

                        if (legendWeight[a.legend] > legendWeight[b.legend]) {
                            return -1;

                        } else {
                            return 1;
                        }
                    });

                    break;
            }
        }

        return orderedArray;
    };

    /**
     * Calculate and returns common grouped line by legend
     *
     * @param {string} orderDirection
     * @returns {Object}
     */
    GlavwebTimeLineChart.prototype.lineCommonGroupedByLegend = function (orderDirection)
    {
        var self = this;

        var commonGrouped = {};
        var lines  = this.getLines();
        $.each(lines, function (key, line) {
            var groupedLine  = self.groupLineByLegend(line, orderDirection);

            $.each(groupedLine, function (key, timePie) {
                var legend = timePie['legend'];
                var minutes = timePie['totalMinutes'];

                if (commonGrouped[legend] !== undefined) {
                    commonGrouped[legend] += minutes;
                } else {
                    commonGrouped[legend] = minutes;
                }
            });
        });

        return commonGrouped;
    };

    /**
     * Get start time
     *
     * @returns {Date}
     */
    GlavwebTimeLineChart.prototype.getStartTime = function ()
    {
        return this.startTime;
    };

    /**
     * Get end time
     *
     * @returns {Date}
     */
    GlavwebTimeLineChart.prototype.getEndTime = function ()
    {
        return this.endTime;
    };

    /**
     * Get all minutes
     *
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.getAllMinutes = function ()
    {
        return this.allMinutes;
    };

    /**
     * Get width
     *
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.getWidth = function ()
    {
        return this.width;
    };

    /**
     * Get minute width
     *
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.getMinuteWidth = function ()
    {
        return this.minuteWidth;
    };

    /**
     * Get count lines
     *
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.getCountLines = function ()
    {
        return this.countLines;
    };

    /**
     * Draw legend bar
     *
     * @param {string} legendBarSelector
     */
    GlavwebTimeLineChart.prototype.drawLegendBar = function (legendBarSelector)
    {
        var legends = this.getLegends();

        var html = '';
        $.each(legends, function (key, legend) {
            html += '<span class="' + legend.class + '" title="' + legend.name + '">' + legend.name + '</span>';
        });


        var legendBar = this.ui.legendBar;
        if (legendBarSelector !== undefined) {
            legendBar = this.wrapper.find(legendBarSelector);
        }

        legendBar.html(html);
    };

    /**
     * Draw time bar
     * 
     * @param {string} timeBarSelector
     */
    GlavwebTimeLineChart.prototype.drawTimeBar = function (timeBarSelector)
    {
        var html      = '';
        var startTime = this.getStartTime();
        var endTime   = this.getEndTime();
        var step      = this.options.step;

        var nextStepTime = this.modifyTimeByNearStep(startTime, step);

        // Add start time
        if (startTime < nextStepTime) {
            html += this.getHtmlTimeBarStep(startTime, this.countMinutesBetweenDates(startTime, nextStepTime));
        }

        // Add rest steps
        var i = 0;
        var maxCycles = 10000;
        var hoursAndMinutesString;
        var lastStepTime;
        while(endTime > nextStepTime && i < maxCycles) {
            html += this.getHtmlTimeBarStep(nextStepTime, step);

            lastStepTime = nextStepTime;
            nextStepTime = this.modifyDateByStep(nextStepTime, step);
            i++;
        }

        // Add end time
        if (endTime > lastStepTime) {
            html += this.getHtmlTimeBarStep(endTime, this.countMinutesBetweenDates(endTime, lastStepTime), this.width);
        }

        var timeBar = this.ui.timeBar;
        if (timeBarSelector !== undefined) {
            timeBar = this.wrapper.find(timeBarSelector);
        }

        timeBar.css('position', 'relative');
        timeBar.html(html);
    };

    /**
     * Get HTML time line step
     *
     * @param {Date}   date
     * @param {number} countMinutes
     * @param {number} positionLeft
     * @returns {string}
     */
    GlavwebTimeLineChart.prototype.getHtmlTimeBarStep = function (date, countMinutes, positionLeft) {
        var hoursAndMinutesString = this.formatHoursAndMinutes(date);
        var timeBarStepWidth      = Math.round(parseFloat(countMinutes * this.getMinuteWidth()) * 100) / 100;

        if (positionLeft === undefined) {
            positionLeft = this.timeBarStepPositionLeft;
        }

        var html = '<span class="time-bar-item" ' +
            'style="position: absolute; width: 100%; margin-left: -50%; text-align:center; left: ' + positionLeft + 'px;"' +
            'title="' + hoursAndMinutesString + '"' +
            '>' + hoursAndMinutesString + '</span>';

        this.timeBarStepPositionLeft += timeBarStepWidth;

        return html;
    };

    /**
     * Draw lines
     */
    GlavwebTimeLineChart.prototype.drawLines = function ()
    {
        var self  = this;
        var lines = this.getLines();

        $.each(lines, function (key, line) {
            self.drawLine(key);
        });
    };

    /**
     * Draw line
     * 
     * @param {string} lineName
     * @param {string} lineSelector
     */
    GlavwebTimeLineChart.prototype.drawLine = function (lineName, lineSelector)
    {
        var self        = this;
        var minuteWidth = this.getMinuteWidth();
        var line        = this.lines[lineName];

        var html  = '';
        $.each(line, function (key, timePie) {
            var legend      = timePie[0];
            var startTime   = timePie[1];
            var endTime     = timePie[2];
            var diffMinutes = self.countMinutesBetweenDates(startTime, endTime);
            var width       = Math.round(parseFloat(diffMinutes * minuteWidth) * 100) / 100;

            html += '<span ' +
                'data-timeline-legend="' + legend + '" ' +
                'data-timeline-start-time="' + self.formatHoursAndMinutes(startTime) + '" ' +
                'data-timeline-end-time="' + self.formatHoursAndMinutes(endTime) + '" ' +
                'class="timeline-item timeline-item-' + legend + '" ' +
                'style="width: ' + width + 'px; display: inline-block;"' +
                '></span>';
        });

        var $lineElement;
        if (lineSelector !== undefined) {
            $lineElement = this.wrapper.find(lineSelector);

        } else {
            $lineElement = this.wrapper.find('[data-timeline=\'' + lineName + '\']');
        }

        $lineElement.html(html);
    };

    /**
     * Draw lines grouped by legend
     *
     * @param {string} orderDirection asc|desc
     * @param {Object} legendWeight
     */
    GlavwebTimeLineChart.prototype.drawGroupedLinesByLegend = function (orderDirection, legendWeight)
    {
        var self  = this;
        var lines = this.getLines();

        $.each(lines, function (key, line) {
            self.drawGroupedLineByLegend(key, null, orderDirection, legendWeight);
        });
    };

    /**
     * Draw line
     *
     * @param {string} lineName
     * @param {string} lineSelector
     * @param {string} orderDirection
     * @param {Object} legendWeight
     */
    GlavwebTimeLineChart.prototype.drawGroupedLineByLegend = function (lineName, lineSelector, orderDirection, legendWeight)
    {
        lineSelector = lineSelector === undefined ? null : lineSelector;

        var self         = this;
        var minuteWidth  = this.getMinuteWidth();
        var line         = this.lines[lineName];
        var groupedLine  = this.groupLineByLegend(line, orderDirection, legendWeight);

        var html  = '';
        var legend, totalMinutes, width;
        $.each(groupedLine, function (key, timePie) {
            legend       = timePie['legend']
            totalMinutes = timePie['totalMinutes'];
            width        = Math.round(parseFloat(totalMinutes * minuteWidth) * 100) / 100;

            html += '<span ' +
                'data-timeline-legend="' + legend + '" ' +
                'data-timeline-total-minutes="' + totalMinutes + '" ' +
                'class="timeline-item timeline-item-' + legend + '" ' +
                'style="width: ' + width + 'px; display: inline-block;"' +
                '></span>';
        });

        var $lineElement;
        if (lineSelector) {
            $lineElement = this.wrapper.find(lineSelector);

        } else {
            $lineElement = this.wrapper.find('[data-timeline=\'' + lineName + '\']');
        }

        $lineElement.html(html);
    };

    /**
     * Draw common grouped line by legend
     *
     * @param {string} lineSelector
     * @param {string} orderDirection
     */
    GlavwebTimeLineChart.prototype.drawLineCommonGroupedByLegend = function (lineSelector, orderDirection)
    {
        lineSelector = lineSelector === undefined ? null : lineSelector;

        var self          = this;
        var minuteWidth   = this.getMinuteWidth() / this.getCountLines();
        var commonGrouped = this.lineCommonGroupedByLegend(orderDirection);

        var html  = '';

        var legend, totalMinutes, width;
        $.each(commonGrouped, function (legend, totalMinutes) {
            width = Math.round(parseFloat(totalMinutes * minuteWidth) * 100) / 100;

            html += '<span ' +
                'data-timeline-legend="' + legend + '" ' +
                'data-timeline-total-minutes="' + totalMinutes + '" ' +
                'class="timeline-item timeline-item-' + legend + '" ' +
                'style="width: ' + width + 'px; display: inline-block;"' +
                '></span>';
        });

        var $lineElement = this.ui.lineCommonGroupedByLegend;
        if (lineSelector !== undefined) {
            $lineElement = this.wrapper.find(lineSelector);
        }

        $lineElement.html(html);
    };

    /**
     * Define lines, start time and end time
     * 
     * @param {Object} data
     * @returns {Object}
     */
    GlavwebTimeLineChart.prototype.parseData = function (data) {
        var timeData = this.getStartAndEndTime(data);
        var startTime = timeData[0];
        var endTime   = timeData[1];
        var lines     = {};

        var legend, startTimeParse, endTimeParse, sliceStartTime, sliceEndTime, slicePrevEndTime;
        $.each(data.lines, function (lineKey, line) {
            lines[lineKey] = [];
            slicePrevEndTime = null;

            $.each(line, function (key, slice) {
                legend         = slice[0];
                startTimeParse = slice[1].split(':');
                endTimeParse   = slice[2].split(':');

                sliceStartTime = new Date(1970, 0, 1, startTimeParse[0], startTimeParse[1]);
                sliceEndTime   = new Date(1970, 0, 1, endTimeParse[0], endTimeParse[1]);

                if (!slicePrevEndTime) {
                    if (startTime && sliceStartTime > startTime) {
                        lines[lineKey].push([
                            'unknown',
                            startTime,
                            sliceStartTime
                        ]);
                    }

                } else if (slicePrevEndTime != sliceStartTime) {
                    if (slicePrevEndTime > sliceStartTime) {
                        throw new Error('The dates must be sequential.');
                    }
                    
                    lines[lineKey].push([
                        'unknown',
                        slicePrevEndTime,
                        sliceStartTime
                    ]);
                }
                slicePrevEndTime = sliceEndTime;

                lines[lineKey].push([
                    legend,
                    sliceStartTime,
                    sliceEndTime
                ]);

                if (sliceStartTime > sliceEndTime) {
                    throw new Error('End time must be more than start time.');
                }
            });

            if (sliceEndTime < endTime) {
                lines[lineKey].push([
                    'unknown',
                    sliceEndTime,
                    endTime
                ]);
            }
        });

        return [lines, startTime, endTime];
    };

    /**
     * Get start and end time
     *
     * @param {Object} data
     * @returns {*[]}
     */
    GlavwebTimeLineChart.prototype.getStartAndEndTime = function (data) {
        var startTime = null;
        var endTime   = null;

        var startTimeParse, endTimeParse, sliceStartTime, sliceEndTime;
        $.each(data.lines, function (lineKey, line) {
            $.each(line, function (key, slice) {
                startTimeParse = slice[1].split(':');
                endTimeParse   = slice[2].split(':');

                sliceStartTime = new Date(1970, 0, 1, startTimeParse[0], startTimeParse[1]);
                sliceEndTime   = new Date(1970, 0, 1, endTimeParse[0], endTimeParse[1]);

                // Define start time
                if (!startTime) {
                    startTime = sliceStartTime;

                } else {
                    if (sliceStartTime < startTime) {
                        startTime = sliceStartTime;
                    }
                }

                // Define end time
                if (!endTime) {
                    endTime = sliceEndTime;

                } else {
                    if (sliceEndTime > endTime) {
                        endTime = sliceEndTime;
                    }
                }
            });
        });

        return [startTime, endTime];
    };

    /**
     * Format hours and minutes
     *
     * @param {Date} date
     * @returns {string}
     */
    GlavwebTimeLineChart.prototype.formatHoursAndMinutes = function (date) {
        return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
    };

    /**
     * Modify date (+ step minutes)
     *
     * @param {Date} date
     * @param {number} step
     * @returns {Date}
     */
    GlavwebTimeLineChart.prototype.modifyDateByStep = function (date, step) {
        return new Date(date.getTime() + step * 60000);
    };

    /**
     * Modify date by near step
     *
     * @param {Date} date
     * @param {int} step
     * @returns {Date}
     */
    GlavwebTimeLineChart.prototype.modifyTimeByNearStep = function (date, step) {

        var modifyDate = new Date(date.getTime());
        var minutes    = modifyDate.getMinutes();
        var newMinutes = Math.ceil(minutes / step) * step;

        modifyDate.setMinutes(newMinutes);

        return modifyDate;
    };

    /**
     * Count minutes
     *
     * @param {Date} startTime
     * @param {Date} endTime
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.countMinutesBetweenDates = function (startTime, endTime)
    {
        return Math.abs(endTime - startTime) / 60000;
    };

    /**
     * Count minutes
     *
     * @param {Object} object
     * @returns {number}
     */
    GlavwebTimeLineChart.prototype.sizeObject = function (object)
    {
        var size = 0, key;
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                size++;
            }
        }

        return size;
    };

    /**
     * Init plugin
     *
     * @param {Object} data
     * @param {Object} options
     * @returns {GlavwebTimeLineChart}
     */
    $.fn.glavwebTimeLineChart = function (data, options) {
        return new GlavwebTimeLineChart(this, data, options);
    };
})(jQuery);