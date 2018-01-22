
Highcharts.chart('container', {
    title: {
        text: 'Try the "sonify" option in the export menu'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
    },
    chart: {
        type: 'spline'
    },
    series: [{
        data: [229.9, 271.5, 306.4, 529.2, 344.0, 476.0, 735.6, 348.5, 316.4,
            394.1, 295.6, 154.4]
    }, {
        data: [129.9, 171.5, 206.4, 429.2, 244.0, 376.0, 635.6, 248.5, 216.4,
            294.1, 195.6, 54.4]
    }]
});
