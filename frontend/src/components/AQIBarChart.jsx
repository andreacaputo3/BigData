import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AQIBarChart = ({ aqiData }) => {

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return 'rgba(40, 167, 69, 0.6)';
        if (aqi <= 100) return 'rgba(255, 193, 7, 0.6)';
        if (aqi <= 150) return 'rgba(255, 165, 0, 0.6)';
        if (aqi <= 200) return 'rgba(255, 87, 34, 0.6)';
        if (aqi <= 300) return 'rgba(211, 47, 47, 0.6)';
        return 'rgba(183, 28, 28, 0.6)';
    };

    const chartData = {
        labels: aqiData.map((dayData) => dayData.date),
        datasets: [
            {
                label: 'AQI Complessivo',
                data: aqiData.map((dayData) => dayData.overallAQI),
                backgroundColor: aqiData.map((dayData) => getAQIColor(dayData.overallAQI)),
                borderColor: aqiData.map((dayData) => getAQIColor(dayData.overallAQI).replace('0.6', '1')),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Trend AQI Complessivo',
            },
        },
    };

    return <Bar data={chartData} options={chartOptions} />;
};

export default AQIBarChart;
