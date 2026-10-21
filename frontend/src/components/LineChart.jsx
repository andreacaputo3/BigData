import React from 'react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const LineChart = ({ data }) => {
    const chartData = {
        labels: data.map((item) => {
            const timestamp = Number(item.datetimeUtc);
            if (isNaN(timestamp)) {
                console.error("Invalid timestamp:", item.datetimeUtc);
                return '';
            }
            return format(new Date(timestamp), 'dd/MM/yyyy');
        }),
        datasets: [
            {
                label: 'Media',
                data: data.map((item) => Number(item.average_value) / 1000),
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: 'rgb(75, 192, 192)',
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.2,
                hidden: false,
            },
        ],
    };

    //console.log("Chart Data:", chartData);

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Andamento della qualità dell\'aria',
                font: {
                    size: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.raw.toFixed(2);
                        return label;
                    },
                },
            },
            legend: {
                display: true,
                onClick: (e, legendItem, chart) => {
                    const datasetIndex = legendItem.datasetIndex;
                    const datasets = chart.chart.data.datasets;

                    const isCurrentlyHidden = datasets[datasetIndex].hidden;
                    if (isCurrentlyHidden) {
                        datasets.forEach((dataset) => {
                            dataset.hidden = false;
                        });
                    } else {
                        datasets.forEach((dataset, index) => {
                            dataset.hidden = index !== datasetIndex;
                        });
                    }

                    chart.chart.update();
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Data',
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Concentrazione (µg/m³)',
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 10,
                },
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default LineChart;
