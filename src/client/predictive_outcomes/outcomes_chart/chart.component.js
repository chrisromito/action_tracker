const R = require('ramda');
const moment = require('moment');
const Chartist = require('chartist');
import 'chartist-plugin-pointlabels';
import 'chartist-plugin-tooltips';
import 'chartist-plugin-axistitle';
import Vue from 'vue';

import * as utils from '../../common/utils';
import { AppStore } from '../app.store';
import { RangeFilter, DateRange } from './chart.rangefilter';


const serialize = (x)=> JSON.parse(JSON.stringify(x))

const itemsAt = (index_arr, x)=> index_arr.reduce(
    (accum, i)=> accum.concat(x[i]), []
).filter(Boolean)


/**
 * Convert an Array of RangeNode instances to an
 * Object representation of the respective chart data
 * @param range_node_arr {Array [RangeNode]}
 * @param validIndexes {Array [Number]}
 * @returns {Object}
 */
const getChartData = (range_node_arr, validIndexes)=> {
    let seriesMap = {
        labels: [],
        series: []
    }
    
    itemsAt(validIndexes, range_node_arr)
        .forEach((item)=> {
            // seriesMap.labels.push(moment(item.date).format('MMM D YY'))
            seriesMap.labels.push(moment(item.date).toDate())

            seriesMap.series.push({
                value: item.userStats.weight,
                meta: `
                    <div class="chart--tooltip-body">
                        ${Math.round(item.userStats.weight)} lbs.
                        <br>
                        ${moment(item.date).format('D of MMM, YYYY')}
                    </div>
                `
            })
        })

    seriesMap.series = [seriesMap.series]

    return seriesMap
}


const getChartHighest_ = R.pipe(
    R.prop('series'),
    R.flatten,
    R.partial(
        R.map,
        [R.compose(Number, R.prop('value'))]    
    ),
    (arr)=> Math.max(...arr),
    // Add 10 so we can have some breathing room for tooltips
    (val)=> val + 10
)


export const ChartComponent = Vue.component('outcome-chart', {
    template: `
        <div class="chart--container"> 
            <div ref="chartElement" class="ct-chart rel"></div>
        </div>
    `,

    data: ()=> ({
        chart: '',

        chartOptions: {
            fullWidth: true,
            height: '500px',
            // minHeight: '500px',
            chartPadding: {
                top: 20,
                right: 5,
                bottom: 30,
                left: 10
            },
            low: 0,
            showArea: true,
            axisY: {
                onlyInteger: true,
            },
            axisX: {
                // type: Chartist.FixedScaleAxis,
                divisor: 2,

                labelInterpolationFnc: (v)=> moment(v).format('MMM D')
            },

            plugins: [
                Chartist.plugins.tooltip({
                    anchorToPoint: true,
                    pointClass: 'point--custom'
                }),

                Chartist.plugins.ctAxisTitle({
                    axisX: {
                        axisTitle: 'Date',
                        axisClass: 'ct-axis-title mdc-theme--on-primary',
                        textAnchor: 'middle',
                        offset: {
                            x: 0,
                            y: 50
                        },
                    },
                    axisY: {
                        axisTitle: 'Weight (lbs)',
                        axisClass: 'ct-axis-title mdc-theme--on-primary',
                        textAnchor: 'middle',
                        flipTitle: false,
                        offset: {
                            x: 0,
                            y: -5
                        }
                    }
                })
            ]
        }
    }),

    computed: {
        dateRange: ()=> AppStore.state.dateRange,
        calorie_intake: ()=> AppStore.state.calorie_intake,
        userStats: ()=> AppStore.state.userStats,
        chartData: function() {
            const dateRangeInstance = new DateRange(
                moment(this.dateRange.start).toDate(),
                moment(this.dateRange.end).toDate()
            )
            const dataIndexes = new RangeFilter(dateRangeInstance).getIndexes()

            const data = getChartData(
                AppStore.getters.rangeScopeNodes(),
                dataIndexes
            )

            return data
        }
    },

    watch: {
        // Redraw when the chart data changes
        chartOptions: function() { this.redraw() },
        chartData: function() { this.redraw() },
        calorie_intake: function() { this.redraw() },
        userStats: function() { this.redraw() },
        dateRange: function() { this.redraw() }
    },

    mounted: function() {
        window._ChartComponent = this
        utils.deferFn(()=> this.redraw())
    },

    updated: function () {
        this.redraw()
    },
    activated: function() {
        this.redraw()
    },

    methods: {

        redraw() {
            /**
             * @method redraw: Update the Chartist instance w/ fresh data
             */
            const scope = this

            return utils.debounce(()=> {
                const chartData = scope.chartData
                const optionsWithHighValue = Object.assign({}, scope.chartOptions, {
                    high: getChartHighest_(chartData)
                })

                if (scope.chart) {
                    // Empty the tooltip body before the chart context changes
                    utils.cEls('.chart--tooltip-body')().forEach(
                        (n)=> n.parentElement.removeChild(n)
                    )

                    scope.chart.update(
                        chartData,
                        optionsWithHighValue
                    )

                } else if (scope.$refs.chartElement) {
                    const chart = new Chartist.Line(
                        scope.$refs.chartElement,
                        serialize(chartData),
                        optionsWithHighValue
                    )
            
                    chart.on('draw', onChartDraw)
            
                    scope.chart = chart
                }
            }, 200)()
        }

    }
})


const onChartDraw = (data)=> {
    // If the draw event was triggered from drawing a point on the line chart
    if (data.type === 'point') {
        const circle = new Chartist.Svg('circle', {
            cx: [data.x],
            cy: [data.y],
            r: [5],
            'ct:value': data.meta || '',
            'ct:meta': '',
            class: 'point--custom',
        }, 'ct-area')

        // With data.element we get the Chartist SVG wrapper.
        // We can replace the original point drawn by Chartist with our new circle
        data.element.replace(circle)
    }
}

