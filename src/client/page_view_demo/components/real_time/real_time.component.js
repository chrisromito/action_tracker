import './real_time.scss'
import * as R from 'ramda'
import * as Chartist from 'chartist'
import 'chartist-plugin-pointlabels'
import 'chartist-plugin-tooltips'
import 'chartist-plugin-axistitle'
import Vue from 'vue'
import * as utils from '../../../common/utils'


const dateLens = R.lensPath(['x'])
const countLens = R.lensPath(['y'])
const seriesLens = R.lensPath(['series', 0])
const metaLens = R.lensPath(['meta'])

const serialize = (x)=> JSON.parse(JSON.stringify(x))

const secondsAgo = (v)=> Number(
    (Date.now() - Math.abs(v)) / 1000
).toFixed(1)


const apMeta = (pageViews)=> (node)=> R.over(
    metaLens,
    R.always(`
        <div class="chart--tooltip-body">
            <span>Active Page Views: ${pageViews.length}</span>
            <br>
            <span>-${secondsAgo(R.view(dateLens, node))}s</span>
        </div>
    `),
    node
)

const setMeta = (series)=> series.map(apMeta(series))


const defaultChartConfig = {
    fullWidth: true,
    lineSmooth: Chartist.Interpolation.simple(),
    low: 0,
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
        divisor: 1,
        type: Chartist.AutoScaleAxis,
        labelInterpolationFnc: R.pipe(secondsAgo, (v)=> `-${v}s`),
        onlyInteger: true
    },
    plugins: [
        Chartist.plugins.tooltip({
            anchorToPoint: true,
            pointClass: 'point--custom'
        }),

        Chartist.plugins.ctAxisTitle({
            axisX: {
                axisTitle: 'Seconds ago',
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


export const RealTimeChart = Vue.component('real-time', {
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
        // chartData: testChartData(),
        chartData: {
            series: [[]]
        },
        chartOptions: defaultChartConfig
    }),

    computed: {
        totalActive: function() {
            /**
             * @method totalActive: Get the total number of active users
             * based on the last object in this.chartData
             * @returns {Number}
             */
            const getTotal = R.pipe(
                R.view(seriesLens),
                R.last,
                R.view(countLens),
                R.defaultTo(0)
            )
            const total = getTotal(this.chartData)
            console.log(`total: ${total}`)
            return total
        },

    },

    watch: {
        // Redraw when the chart data changes
        chartOptions: function() { this.redraw() },
        chartData: function() {
            this.redraw()
            // If our total is < 50; set the chart options' 'high' value to 50
            const total = this.totalActive
            if (total < 25) {
                this.chartOptions = Object.assign({}, this.chartOptions, {
                    high: 25
                })
            } else {
                this.chartOptions = Object.assign({}, this.chartOptions, defaultChartConfig)
            }
        },
    },

    mounted: function() {
        window._ChartComponent = this
        utils.deferFn(()=> this.redraw())

        // Watch the store real_time.pageViews
        // When it changes, update our chartData so it is aware
        // of the number of active pageViews for each update
        this.$store.subscribe((mutation, state)=> {
                if (mutation.type !== 'real_time/setPageViews') {
                    return false
                }
                const scope = this
                const pageViews = state.real_time.pageViews
                const nodeX = Date.now()
                const seriesPoints = scope.chartData.series[0].concat({
                        x: nodeX,
                        y: pageViews.length
                    }).slice(-10)

                const newSeries = setMeta(seriesPoints)

                scope.chartData = Object.assign({}, scope.chartData, {
                    // labels: newSeries.map(displayTime),
                    series: [newSeries]
                })

                setTimeout(()=> scope.$store.dispatch('real_time/refresh'), 3000)
            }
        )

        this.$store.dispatch('real_time/refresh')

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

                if (scope.chart) {
                    // Remove lingering tooltip elements
                    utils.children('.chart--tooltip-body')().forEach(utils.remove)

                    scope.chart.update(chartData)
                } else if (scope.$refs.chartStream) {
                    const chart = new Chartist.Line(
                        scope.$refs.chartStream,
                        serialize(chartData),
                        this.chartOptions
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


window.R = R
