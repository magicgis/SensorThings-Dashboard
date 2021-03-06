import Mocha, {
    describe,
    it,
    before,
    beforeEach,
    after
} from 'mocha';
import Chai, {
    expect
} from 'chai';
import {
    BarGraphWidgetFactory
} from '../../src/DashboardServices/BarGraphWidgetFactory.js';
import {
    View
} from '../../src/View/View.js'
import {
    WidgetFactory
} from '../../src/DashboardServices/WidgetFactory.js';

/**
 * The following test tests every feature of the BarGraphWidgetFactory
 * @param string
 *      The displayed name of this test suite
 */
describe("BarGraphWidgetFactory test", () => {
    let _barGraphWidgetFactory;
    let htmlTemplate = '<div id="templateWidget" class="grid-stack-item-content">' +
        '<div class="widget-header">' +
        '<div class="widget-title">Widget-Title & Info</div>' +
        '<button type="button" class="btn btn-danger remove-widget-button" id="removeWidgetButton">X</button>' +
        '</div>' +
        '<canvas id="templateWidgetCanvas" width="350" height="280"></canvas>' +
        '<div class="widget-footer"><div class="lastUpdate" id="templateWidgetLastUpdate"></div>' +
        '<button class="btn btn-sm btn-default configureWidgetButton" id="configureWidgetButton" aria-label="Settings">' +
        '<span class="glyphicon glyphicon-cog" aria-hidden="true"></span>' +
        '</button>' +
        '</div>' +
        '</div>';

    var jsdom = require('mocha-jsdom');

    beforeEach(function(){
        $("body").html("");
    });

    let configLoad = function () {
        let nextHourTime = new Date();
        nextHourTime.setMinutes(new Date().getMinutes() + 1);

        return {
            title: {
                data: 'BarGraph Widget',
                type: TYPE_STRING
            },
            colors: {
                data: [{
                    data: {
                        barColor: {
                            data: '#000000',
                            type: TYPE_COLOR
                        }
                    },
                    type: TYPE_OBJECT
                }],
                type: TYPE_ARRAY
            },
            backgroundBarcolor1: {
                data: '#ffffff',
                type: TYPE_COLOR
            },
            backgroundBarcolor2: {
                data: '#ffffff',
                type: TYPE_COLOR
            },
            backgroundGrid: {
                data: true,
                type: TYPE_BOOLEAN
            },
            // there will be more, be pacient :)

            // Data filter
            timeIntervalRelative: {
                data: true,
                type: TYPE_BOOLEAN
            },
            timeIntervalUnit: {
                data: UNIT_MINUTE,
                type: TYPE_DROPDOWN,
                options: {
                    second: UNIT_SECOND,
                    minute: UNIT_MINUTE,
                    hour: UNIT_HOUR,
                    day: UNIT_DAY,
                    month: UNIT_MONTH,
                    year: UNIT_YEAR
                }
            },
            timeInterval: {
                data: 5,
                type: TYPE_INTEGER
            },
            timeGroups: {
                data: 3,
                type: TYPE_INTEGER
            },
            startTime: {
                data: new Date(),
                type: TYPE_DATE
            },
            endTime: {
                data: nextHourTime,
                type: TYPE_DATE
            },

            // ST configuration Attention: mulitple Sensors are possible
            sensorThingsConfiguration: {
                data: [{
                    data: {
                        dataStreamUrl: {
                            data: '',
                            type: TYPE_FUZZY_SENSOR_SEARCH
                        },
                        mqttEnabled: {
                            data: false,
                            type: TYPE_BOOLEAN
                        },
                        mqttUrl: {
                            data: '',
                            type: TYPE_STRING
                        },
                        mqttBaseTopic: {
                            data: '',
                            type: TYPE_STRING
                        },
                        updateIntervalMs: {
                            data: 1000,
                            type: TYPE_INTEGER
                        }
                    },
                    type: TYPE_OBJECT
                }],
                type: TYPE_ARRAY
            },

            titleY: {
                data: "New 9GAG memes",
                type: TYPE_STRING
            }
        }
    };

    after(function () {
        this.jsdom();
    });

    // first initialization of resources
    before(function (done) {
        this.jsdom = require('jsdom-global')();
        window.iotBaseDir = process.cwd().split("\\").join("/") + "/public/";
        window.iotlg = {
            widgetBarGraphTitle: "My Title"
        };
        global.$ = global.jQuery = require('jquery');
        global.L = require('leaflet');
        //define global vars
        global.TYPE_COLOR = 0;
        global.TYPE_STRING = 1;
        global.TYPE_INTEGER = 2;
        global.TYPE_BOOLEAN = 3;
        global.TYPE_ARRAY = 4;
        global.TYPE_DATE = 5;
        global.TYPE_DROPDOWN = 6;
        global.TYPE_NUMBER = 7;
        global.TYPE_FUZZY_SENSOR_SEARCH = 8;
        global.TYPE_OBJECT = 9;
        global.TYPE_OTHER = 10;
        global.UNIT_MILLISECOND = 0;
        global.UNIT_SECOND = 1;
        global.UNIT_MINUTE = 2;
        global.UNIT_HOUR = 3;
        global.UNIT_DAY = 4;
        global.UNIT_MONTH = 5;
        global.UNIT_YEAR = 6;

        window.RGraph = global.RGraph = {
            isRGraph: true
        };
        window.RGraph.reset = window.RGraph.Clear = function () {
        };
        require("../../public/libs/RGraph.common.core");
        window.RGraph.Bar = function () {
            return {
                draw: function () {
                }
            };
        };

        Number.prototype.square = function () {
            return this.valueOf() * this.valueOf();
        };

        _barGraphWidgetFactory = new BarGraphWidgetFactory(new WidgetFactory());
        _barGraphWidgetFactory._resizeCanvas = () => {
        };
        new View()._setUpLanguage("en");
        done();
    });

    let expectDeltaLessThan = (res1, res2, delta) => {

        let delta1 = res1.max.getTime() - res2.max.getTime();
        let delta2 = res1.min.getTime() - res2.min.getTime();
        expect(delta1.square() + delta2.square()).to.be.lessThan(delta);
    };
    /**
     * Performed test: test if BarGraphWidgetFactory is a Singelton
     * @param string
     *      Name of the this test
     */
    it('Factory should be a Singleton', function (done) {
        var factory1 = new BarGraphWidgetFactory();
        var factory2 = new BarGraphWidgetFactory();
        // Expect factories to be the same
        expect(factory1).to.eql(factory2);
        done();
    });

    /**
     * Test format function of the BarGraphWidgetFactory
     * @param string
     *      Name of the this test
     */
    it('Factory formats array', function (done) {
        let factory = new BarGraphWidgetFactory();
        let data = {
            lineColors: {
                data: [{
                    data: {
                        lineColor: {
                            data: '#000000',
                            type: TYPE_COLOR
                        }
                    },
                    type: TYPE_OBJECT
                }, {
                    data: {
                        lineColor: {
                            data: '#aaaaaa',
                            type: TYPE_COLOR
                        }
                    },
                    type: TYPE_OBJECT
                }],
                type: TYPE_ARRAY
            }
        };
        let result = ['#000000', '#aaaaaa'];
        // Expect formated object to be formatted to an array
        expect(factory._formatConfigurableData(data).lineColors.data).to.eql(result);
        done();
    });

    /**
     * Test if dateFormat formats time correctly
     * @param string
     *      Name of the this test
     */
    it('Factory formats date', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date = new Date(0);
        let dateString = "1970:01:01\n00:00:00";
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        // Expect time format to be the correct
        expect(factory._formatDate(date, 0)).to.eql(dateString);
        done();
    });

    /**
     * Test if dateFormat formats time with offset correctly
     * @param string
     *      Name of the this test
     */
    it('Factory formats date offset', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date = new Date(0);
        let dateString = "1970:01:02\n01:00:00";
        // set window iotlg
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        // Expect time format to be the correct
        expect(factory._formatDate(date, 25)).to.eql(dateString);
        done();
    });

    /**
     * Test if dateFormat formats time with offset correctly
     * @param string
     *      Name of the this test
     */
    it('Factory formats date negativ offset', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date = new Date(60 * 60 * 1000 * 4);
        let dateString = "1970:01:01\n00:00:00";
        // set window iotlg
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        // Expect time format to be the correct
        expect(factory._formatDate(date, -4)).to.eql(dateString);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence zero', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        let result = {
            unit: UNIT_MILLISECOND,
            difference: 0,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 100 ms', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(100);
        let result = {
            unit: UNIT_MILLISECOND,
            difference: 100,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 10 sec', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(10000);
        let result = {
            unit: UNIT_SECOND,
            difference: 10000,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 1 min', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(60000);
        let result = {
            unit: UNIT_MINUTE,
            difference: 60000,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 1 h', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(3600000);
        let result = {
            unit: UNIT_HOUR,
            difference: 3600000,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 1 day', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(3600000 * 24);
        let result = {
            unit: UNIT_DAY,
            difference: 3600000 * 24,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 1 month', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(3600000 * 24 * 31);
        let result = {
            unit: UNIT_MONTH,
            difference: 3600000 * 24 * 31,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if timediffrence calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory time diffrence 1 year', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(0);
        date2.setTime(3600000 * 24 * 365);
        let result = {
            unit: UNIT_YEAR,
            difference: 3600000 * 24 * 365,
            startDate: date1,
            endDate: date2
        };
        // Expect time format to be the correct
        expect(factory._calcBiggestTimeUnitDifference(date1, date2)).to.eql(result);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 0 ms', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(0, UNIT_MILLISECOND)).to.eql(0);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 1 s', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(1, UNIT_SECOND)).to.eql(1000);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 30 min', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(30, UNIT_MINUTE)).to.eql(1800000);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 1 h', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(1, UNIT_HOUR)).to.eql(3600000);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 1 day', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(1, UNIT_DAY)).to.eql(3600000 * 24);
        done();
    });

    /**
     * Test if get milliseconds calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory get milliseconds from 2 year', function (done) {
        let factory = new BarGraphWidgetFactory();
        // Expect time format to be the correct
        expect(factory._getMilliseconds(2, UNIT_YEAR)).to.eql(2 * 3600000 * 24 * 365);
        done();
    });

    /**
     * Test calcLableTicks calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc labelTicks 9 groups, only check lables', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(9);
        let offset = -Math.ceil((new Date().getTimezoneOffset()) / 60);
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        let res = [
            factory._formatDate(new Date(0), offset) + "\n - \n" + factory._formatDate(new Date(1), offset),
            factory._formatDate(new Date(1), offset) + "\n - \n" + factory._formatDate(new Date(2), offset),
            factory._formatDate(new Date(2), offset) + "\n - \n" + factory._formatDate(new Date(3), offset),
            factory._formatDate(new Date(3), offset) + "\n - \n" + factory._formatDate(new Date(4), offset),
            factory._formatDate(new Date(4), offset) + "\n - \n" + factory._formatDate(new Date(5), offset),
            factory._formatDate(new Date(5), offset) + "\n - \n" + factory._formatDate(new Date(6), offset),
            factory._formatDate(new Date(6), offset) + "\n - \n" + factory._formatDate(new Date(7), offset),
            factory._formatDate(new Date(7), offset) + "\n - \n" + factory._formatDate(new Date(8), offset),
            factory._formatDate(new Date(8), offset) + "\n - \n" + factory._formatDate(new Date(9), offset)
        ];
        // Expect time format to be the correct
        expect(factory._calcLabelTicks(date1, date2, 9).label).to.eql(res);
        done();
    });

    /**
     * Test calcLableTicks calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc labelTicks, test start Date', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(9);
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        // Expect time format to be the correct
        expect(factory._calcLabelTicks(date1, date2, 10).startDate).to.eql(date1);
        done();
    });

    /**
     * Test calcLableTicks calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc labelTicks, test end Date', function (done) {
        let factory = new BarGraphWidgetFactory();
        let date1 = new Date(0);
        let date2 = new Date(9);
        window.iotlg = {
            dateFormat: "yyyy:mm:dd hh:MM:ss"
        };
        // Expect time format to be the correct
        expect(factory._calcLabelTicks(date1, date2, 10).endDate).to.eql(date2);
        done();
    });

    /**
     * Test meanValue calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc mean of array, size=0', function (done) {
        let factory = new BarGraphWidgetFactory();
        let arr = [];
        let res = 0;
        // Expect time format to be the correct
        expect(factory._calcMeanFromArray(arr)).to.eql(res);
        done();
    });

    /**
     * Test meanValue calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc mean of array, size=1', function (done) {
        let factory = new BarGraphWidgetFactory();
        let arr = [1];
        let res = 1;
        // Expect time format to be the correct
        expect(factory._calcMeanFromArray(arr)).to.eql(res);
        done();
    });

    /**
     * Test meanValue calculation of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc mean of array, size=2', function (done) {
        let factory = new BarGraphWidgetFactory();
        let arr = [2, 4];
        let res = 3;
        // Expect time format to be the correct
        expect(factory._calcMeanFromArray(arr)).to.eql(res);
        done();
    });

    /**
     * Test convertedDataToBarData of factory
     * @param string
     *      Name of the this test
     */
    it('Factory convert data, test one dataStream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = {
            Observations: [{
                Observation_phenomenonTime: new Date(0),
                Observation_result: 24
            }, {
                Observation_phenomenonTime: new Date(10),
                Observation_result: 12
            }, {
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 0.5
            }],
            otherRandomStuff: "peter"
        };
        let data = [stream1];
        let resultStream1 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(10).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let result = [resultStream1];

        // perform test
        expect(factory._convertedDataToBarData(data)).to.eql(result);
        done();
    });

    /**
     * Test convertedDataToBarData of factory
     * @param string
     *      Name of the this test
     */
    it('Factory convert data, test two dataStream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = {
            Observations: [{
                Observation_phenomenonTime: new Date(0),
                Observation_result: 24
            }, {
                Observation_phenomenonTime: new Date(1000),
                Observation_result: 12
            }, {
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 0.5
            }],
            otherRandomStuff: "peter"
        };
        let stream2 = {
            Observations: [{
                Observation_phenomenonTime: new Date(0),
                Observation_result: 24
            }, {
                Observation_phenomenonTime: new Date(1000),
                Observation_result: 12
            }, {
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 0.5
            }],
            otherRandomStuff: "peter"
        };
        let data = [stream1, stream2];
        let resultStream1 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let resultStream2 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let result = [resultStream1, resultStream2];

        // perform test
        expect(factory._convertedDataToBarData(data)).to.eql(result);
        done();
    });

    /**
     * Test convertedDataToBarData of factory
     * @param string
     *      Name of the this test
     */
    it('Factory convert data, test sort one dataStream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = {
            Observations: [{
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 24
            }, {
                Observation_phenomenonTime: new Date(1000),
                Observation_result: 12
            }, {
                Observation_phenomenonTime: new Date(3000),
                Observation_result: 0.5
            }],
            otherRandomStuff: "peter"
        };
        let data = [stream1];
        let resultStream1 = [
            [
                new Date(1000).toUTCString(), 12
            ],
            [
                new Date(2000).toUTCString(), 24
            ],
            [new Date(3000).toUTCString(), 0.5]
        ];
        let result = [resultStream1];

        // perform test
        expect(factory._convertedDataToBarData(data)).to.eql(result);
        done();
    });

    /**
     * Test convertedDataToBarData of factory
     * @param string
     *      Name of the this test
     */
    it('Factory convert data, test two dataStream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = {
            Observations: [{
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 0.5
            }, {
                Observation_phenomenonTime: new Date(1000),
                Observation_result: 12
            }, {
                Observation_phenomenonTime: new Date(0),
                Observation_result: 24
            }],
            otherRandomStuff: "peter"
        };
        let stream2 = {
            Observations: [{
                Observation_phenomenonTime: new Date(0),
                Observation_result: 24
            }, {
                Observation_phenomenonTime: new Date(2000),
                Observation_result: 0.5
            }, {
                Observation_phenomenonTime: new Date(1000),
                Observation_result: 12
            }],
            otherRandomStuff: "peter"
        };
        let data = [stream1, stream2];
        let resultStream1 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let resultStream2 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let result = [resultStream1, resultStream2];

        // perform test
        expect(factory._convertedDataToBarData(data)).to.eql(result);
        done();
    });

    /**
     * Test Calculated relative min and max for scattered Data of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc relative min/max, test one dataStream with to big delta', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let data = [stream1];
        let delta = 999999;
        let result = {
            min: new Date(0),
            max: new Date(2000)
        };
        // perform test
        expectDeltaLessThan(factory._getRelativMinAndMax(data, delta), result, 2);
        done();
    });

    /**
     * Test Calculated relative min and max for scattered Data of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc relative min/max, test two dataStream with to big delta', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(2000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let stream2 = [
            [
                new Date(3000).toUTCString(), 24
            ],
            [
                new Date(4000).toUTCString(), 12
            ],
            [new Date(5000).toUTCString(), 0.5]
        ];
        let data = [stream1, stream2];
        let delta = 999999;
        let result = {
            min: new Date(1000),
            max: new Date(5000)
        };
        // perform test
        expectDeltaLessThan(factory._getRelativMinAndMax(data, delta), result, 2);
        done();
    });

    /**
     * Test Calculated relative min and max for scattered Data of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc relative min/max, test one dataStream with cut off delta', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(0).toUTCString(), 24
            ],
            [
                new Date(1000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let data = [stream1];
        let delta = 1000;
        let result = {
            min: new Date(1000),
            max: new Date(2000)
        };
        // perform test
        expectDeltaLessThan(factory._getRelativMinAndMax(data, delta), result, 2);
        done();
    });

    /**
     * Test Calculated relative min and max for scattered Data of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc relative min/max, test two dataStream with cut off delta', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(2000).toUTCString(), 12
            ],
            [new Date(2000).toUTCString(), 0.5]
        ];
        let stream2 = [
            [
                new Date(3000).toUTCString(), 24
            ],
            [
                new Date(4000).toUTCString(), 12
            ],
            [new Date(5000).toUTCString(), 0.5]
        ];
        let data = [stream1, stream2];
        let delta = 1000;
        let result = {
            min: new Date(4000),
            max: new Date(5000)
        };
        // perform test
        expectDeltaLessThan(factory._getRelativMinAndMax(data, delta), result, 2);
        done();
    });

    /**
     * Test Calculated relative min and max for scattered Data of factory
     * @param string
     *      Name of the this test
     */
    it('Factory calc relative min/max, test one dataStream from the future', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(10000).toUTCString(), 24
            ],
            [
                new Date(20000).toUTCString(), 12
            ],
            [
                new Date(new Date().getTime() + 100000).toUTCString(),
                0.5
            ]
        ];
        let stream2 = [
            [
                new Date(30000).toUTCString(), 24
            ],
            [
                new Date(40000).toUTCString(), 12
            ],
            [new Date(50000).toUTCString(), 0.5]
        ];
        let data = [stream1, stream2];
        let delta = new Date().getTime;
        let result = {
            min: new Date(10000),
            max: new Date()
        };
        // perform test
        expectDeltaLessThan(factory._getRelativMinAndMax(data, delta), result, 2);
        done();
    });

    /**
     * Test trim data of the factory
     * @param string
     *      Name of the this test
     */
    it('Factory trim data, no trim needed, one datastream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(2000).toUTCString(), 12
            ],
            [new Date(3000).toUTCString(), 0.5]
        ];
        let data = [stream1];
        let min = new Date(0);
        let max = new Date(5000);
        let resultStream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(2000).toUTCString(), 12
            ],
            [new Date(3000).toUTCString(), 0.5]
        ];
        let result = [resultStream1];

        // perform test
        expect(factory._trimData(min, max, data)).to.eql(result);
        done();
    });

    /**
     * Test trim data of the factory
     * @param string
     *      Name of the this test
     */
    it('Factory trim data, trim needed both sides, one datastream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(3000).toUTCString(), 12
            ],
            [new Date(8000).toUTCString(), 0.5]
        ];
        let data = [stream1];
        let min = new Date(2000);
        let max = new Date(5000);
        let resultStream1 = [
            [new Date(3000).toUTCString(), 12]
        ];
        let result = [resultStream1];

        // perform test
        expect(factory._trimData(min, max, data)).to.eql(result);
        done();
    });

    /**
     * Test trim data of the factory
     * @param string
     *      Name of the this test
     */
    it('Factory trim data, trim needed both sides, two datastream', function (done) {
        let factory = new BarGraphWidgetFactory();
        let stream1 = [
            [
                new Date(1000).toUTCString(), 24
            ],
            [
                new Date(3000).toUTCString(), 12
            ],
            [new Date(8000).toUTCString(), 0.5]
        ];
        let stream2 = [
            [
                new Date(3000).toUTCString(), 24
            ],
            [
                new Date(4000).toUTCString(), 12
            ],
            [new Date(8000).toUTCString(), 0.5]
        ];
        let data = [stream1, stream2];
        let min = new Date(2000);
        let max = new Date(5000);
        let resultStream1 = [
            [new Date(3000).toUTCString(), 12]
        ];
        let resultStream2 = [
            [
                new Date(3000).toUTCString(), 24
            ],
            [new Date(4000).toUTCString(), 12]
        ];
        let result = [resultStream1, resultStream2];

        // perform test
        expect(factory._trimData(min, max, data)).to.eql(result);
        done();
    });

    /**
     * Test fillUp of the factory
     * @param string
     *      Name of the this test
     */
    it('Test fillUp function of factory', function (done) {
        let factory = new BarGraphWidgetFactory(new WidgetFactory());
        let result = factory._fillUp(2, 2)

        // perform test
        expect(result).to.eql("02");
        done();
    });

    /**
     * Tests whether widget is created correctly with data
     */
    it("Test widget creating", (done) => {
        let tlw;
        let title = () => $(".widget-title")[0].innerText;

        let configUpdate = configLoad;

        let dataUpdate = function () {
            return [{
                Observations: [{
                    Observation_phenomenonTime: new Date(2000),
                    Observation_result: 0.5
                }, {
                    Observation_phenomenonTime: new Date(1000),
                    Observation_result: 12
                }, {
                    Observation_phenomenonTime: new Date(0),
                    Observation_result: 24
                }],
                otherRandomStuff: "peter"
            }, {
                Observations: [{
                    Observation_phenomenonTime: new Date(2000),
                    Observation_result: 0.5
                }, {
                    Observation_phenomenonTime: new Date(1000),
                    Observation_result: 12
                }, {
                    Observation_phenomenonTime: new Date(0),
                    Observation_result: 24
                }],
                otherRandomStuff: "peter"
            }];
        };

        let callback = (htmlId, updateData, updateConfig) => {
            $("canvas").ready(() => {
                updateConfig(configUpdate());
                updateData(dataUpdate());

                // Test title of the widget
                expect(title()).to.equal(configLoad().title.data);
                done();
            })
        };

        tlw = _barGraphWidgetFactory.create("Test", callback, htmlTemplate);
        $("body").append(tlw);
    });

    /**
     * Tests whether widget is created correctly without data
     */
    it("Test widget creating without init data and update afterwards", (done) => {
        let tlw;
        let title = () => $(".widget-title")[0].innerText;

        let configUpdate = configLoad;

        let dataUpdate = function () {
            return [];
        };

        let secondDataUpdate = function () {
            return [
                {
                    Observations: [
                        {
                            Observation_phenomenonTime: new Date(2000),
                            Observation_result: 0.5
                        }, {
                            Observation_phenomenonTime: new Date(1000),
                            Observation_result: 12
                        }, {
                            Observation_phenomenonTime: new Date(0),
                            Observation_result: 24
                        }
                    ],
                    otherRandomStuff: "peter"
                }, {
                    Observations: [
                        {
                            Observation_phenomenonTime: new Date(2000),
                            Observation_result: 0.5
                        }, {
                            Observation_phenomenonTime: new Date(1000),
                            Observation_result: 12
                        }, {
                            Observation_phenomenonTime: new Date(0),
                            Observation_result: 24
                        }
                    ],
                    otherRandomStuff: "peter"
                }
            ];
        };

        let callback = (htmlId, updateData, updateConfig) => {
            $("canvas").ready(() => {
                updateConfig(configUpdate());
                updateData(dataUpdate());
                updateData(secondDataUpdate());

                // Test title of the widget
                expect(title()).to.equal(configLoad().title.data);
                done();
            })
        };

        tlw = _barGraphWidgetFactory.create("Test", callback, htmlTemplate);
        $("body").append(tlw);
    });

    /**
     * Tests whether widget is created correctly without data
     */
    it("Test widget creating without init data", (done) => {
        let tlw;
        let title = () => $(".widget-title")[0].innerText;

        let configUpdate = configLoad;

        let dataUpdate = function () {
            return [];
        };

        let callback = (htmlId, updateData, updateConfig) => {
            $("canvas").ready(() => {
                updateConfig(configUpdate());
                updateData(dataUpdate());

                // Test title of the widget
                expect(title()).to.equal(configLoad().title.data);
                done();
            })
        };

        tlw = _barGraphWidgetFactory.create("Test", callback, htmlTemplate);
        $("body").append(tlw);
    });

});
