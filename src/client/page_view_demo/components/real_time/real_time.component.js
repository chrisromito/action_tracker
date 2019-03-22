import './real_time.scss';
import * as R from 'ramda';
import * as moment from 'moment';
import * as Chartist from 'chartist'
import 'chartist-plugin-pointlabels';
import 'chartist-plugin-tooltips';
import 'chartist-plugin-axistitle';
import Vue from 'vue';

import * as utils from '../../../common/utils';

const dateLens = R.lensPath(['x'])
const countLens = R.lensPath(['y'])
const seriesLens = R.lensPath(['series', 0])

const serialize = (x)=> JSON.parse(JSON.stringify(x))

const secondsAgo = (v)=> Number(
    (Date.now() - Math.abs(v)) / 1000
).toFixed(1)

const randomIntBetween = (min, max)=> Math.floor(
    Math.random() * (max - min)
) + min


const isEven = (n)=> n % 2 === 0

const liftY = R.ifElse(
    isEven,
    R.multiply(12, R.__),
    R.multiply(8, R.__)
)


const seriesSpecMeta = (item)=> R.set(
    R.lensPath(['meta']),
    `<div class="chart--tooltip-body">
        <span>Active Page Views: ${liftY(item.y)}</span>
        <span>-${secondsAgo(item.x)}s</span>
    </div>`,
    item
)

const seriesSpec = R.pipe(
    (index)=> ({
        x: (Date.now() - (index * 5000)) * -1,
        y: liftY(index)
    }),
    seriesSpecMeta
)

const testChartData = ()=> R.range(0, 20).map(seriesSpec)
    .reduce((accum, item)=> R.pipe(
        R.over(
            R.lensPath(['labels']),
            R.append(secondsAgo(item.x) * -1)
        ),
        R.over(
            seriesLens,
            R.append(item)
        )
    )(accum), {
        labels: [],
        series: [[]]
})


export const RealTimeComponent = Vue.component('real-time', {
    template: `
        <div id="chart--real-time" class="chart--real-time--card mdc-card">
            <h3 class="mdc-typography--headline4 margin--15">
                Active Users: <span class="mdc-typography--headline4">{{ totalActive }}</span>
            </h3>
            <div class="chart--real-time--chart-container pad--15">
                <div ref="chartStream" class="chart--stream ct-chart ct-chart ct-golden-section"></div>
            </div>
        </div>
    `,

    data: ()=> ({
        chart: '',

        // chartData: R.dissoc('labels', testChartData()),
        chartData: testChartData(),

        chartOptions: {
            fullWidth: true,
            lineSmooth: Chartist.Interpolation.simple(),
            showPoint: false,
            chartPadding: {
                top: 20,
                right: 5,
                bottom: 30,
                left: 10
            },
            axisY: {
                onlyInteger: true,
            },
            axisX: {
                // type: Chartist.FixedScaleAxis,
                // divisor: 5,
                type: Chartist.AutoScaleAxis,
                labelInterpolationFnc: secondsAgo
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
                        axisTitle: 'Active Users',
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
        totalActive: function() {
            /**
             * @method totalActive: Get the total number of active users
             * based on the last object in this.chartData
             * @returns {Number}
             */
            const getTotal = R.pipe(R.view(seriesLens), R.last, R.view(countLens))
            const total = getTotal(this.chartData)
            console.log(`total: ${total}`)
            return total
        }

        // chartData: function() {
        //     // return testChartData()
        //     return R.dissoc('labels', testChartData())
        // }
    },

    watch: {
        // Redraw when the chart data changes
        chartOptions: function() { this.redraw() },
        chartData: function() { this.redraw() },
    },

    mounted: function() {
        window._ChartComponent = this
        window.R = R
        utils.deferFn(()=> this.redraw())
    },

    updated: function () {
        this.redraw()
    },
    activated: function() {
        this.redraw()
    },

    methods: {

        pushChartUpdate(data) {
            const scope = this
            // const newLabels = scope.chartData.labels.concat(data.x)
            const newSeries = scope.chartData.series[0].concat(data)

            this.chartData = Object.assign({}, this.chartData, {
                // labels: newLabels,
                series: [newSeries]
            })
        },

        redraw() {
            /**
             * @method redraw: Update the Chartist instance w/ fresh data
             */
            const scope = this

            return utils.debounce(()=> {
                const chartData = scope.chartData

                if (scope.chart) {
                    scope.chart.update(chartData)
                } else if (scope.$refs.chartStream) {
                    const chart = new Chartist.Line(
                        scope.$refs.chartStream,
                        serialize(chartData)
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
