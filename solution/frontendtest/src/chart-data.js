//var dataPack1 = [8, 5, 2, 7, -1, 11, 8, 9];
//var dataPack2 = [4.8, 12.1, 12.7, 6.7, 13.8, 11.4, 5.7, 4.2]; '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'

var dataPack1 = [];
var dataPack2 = [];

export const readingsChartData = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: "Value 1", 
                fill: true, 
                backgroundColor: "rgba(14, 47, 165, 0.3)", // <-- supposed to be light blue
                data: dataPack1,
            },
            {
                label: "Value 2",
                fill: true,
                backgroundColor: "rgba(196, 93, 105, 0.3)",
                data: dataPack2,
            }
        ]
    },
    options: {
        title: {
            display: true,
            text: "Linkener Readings",
            position: "top"
        },
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: false,
          }]
        },
        legend: {
          display: true,
        }
    }
}


export default readingsChartData;



/*
export const readingsChartData = {
    type: 'line',
    data: {
        labels: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        datasets: [
        { // one line graph
            fill: true,
            label: 'Value 1',
            data: [8, 5, 2, 7, -1, 11, 8, 9],
            backgroundColor: [
            'rgba(14, 47, 165)', // Blue
            ],
            borderColor: [
            '#36495d',
            '#36495d',
            ],
            borderWidth: 3
        },
        { // another line graph
            fill: true,
            label: 'Value 2',
            data: [4.8, 12.1, 12.7, 6.7, 13.8, 11.4, 5.7, 4.2],
            backgroundColor: [
            'rgba(130, 25, 6)', // Green
            ],
            borderColor: [
            '#47b784',
            ],
            borderWidth: 3
        }
        ]
    },
    options: {
        responsive: true,
        lineTension: 1,
        scales: {
            yAxes: [{
                ticks: {
                beginAtZero: true,
                padding: 25,
                }
            }]
        },
        legend: {
            display: false
        }
    }
}

export default readingsChartData; */