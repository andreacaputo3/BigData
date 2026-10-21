import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS = {
    pm25: [
        { max: 12, color: "rgba(76, 175, 80, 0.6)" }, // Verde
        { max: 35.4, color: "rgba(255, 235, 59, 0.6)" }, // Giallo
        { max: 55.4, color: "rgba(255, 152, 0, 0.6)" }, // Arancio
        { max: 150.4, color: "rgba(244, 67, 54, 0.6)" }, // Rosso
        { max: 250.4, color: "rgba(211, 47, 47, 0.6)" }, // Rosso scuro
        { max: Infinity, color: "rgba(183, 28, 28, 0.6)" }, // Rosso intenso
    ],
    pm10: [
        { max: 20, color: "rgba(76, 175, 80, 0.6)" }, // Verde (0–20 µg/m³)
        { max: 50, color: "rgba(255, 235, 59, 0.6)" }, // Giallo (21–50 µg/m³)
        { max: 100, color: "rgba(255, 152, 0, 0.6)" }, // Arancio (51–100 µg/m³)
        { max: 200, color: "rgba(244, 67, 54, 0.6)" }, // Rosso (101–200 µg/m³)
        { max: 300, color: "rgba(211, 47, 47, 0.6)" }, // Rosso scuro (201–300 µg/m³)
        { max: Infinity, color: "rgba(183, 28, 28, 0.6)" }, // Rosso intenso
    ],
};

const getColorForValue = (value, type) => {
    const typeColors = COLORS[type] || [];
    const colorConfig = typeColors.find((config) => value <= config.max);
    return colorConfig ? colorConfig.color : "rgba(0, 0, 0, 0.6)";
};

const AnomalyBarChart = ({ anomalyData, type }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (!anomalyData || anomalyData.length === 0) {
            setChartData({});
            return;
        }

        const labels = anomalyData.map((data) => {
            if (data.date) {
                const date = new Date(data.date);
                return date.toLocaleDateString("it-IT");
            }
            return "Data non disponibile";
        });

        const maxValues = anomalyData.map((data) => data.max_value);
        const colors = anomalyData.map((data) => getColorForValue(data.max_value, type));

        setChartData({
            labels,
            datasets: [
                {
                    label: `${type}`,
                    data: maxValues,
                    backgroundColor: colors,
                    borderColor: colors.map((color) => color.replace("0.6", "1")),
                    borderWidth: 1,
                },
            ],
        });

        setChartOptions({
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: `Valori Inquinamento (${type})`,
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            const label = context.dataset.label || "";
                            return `${label}: ${value} µg/m³`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Concentrazione (µg/m³)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Data",
                    },
                },
            },
        });
    }, [anomalyData, type]);

    if (!chartData.labels || chartData.labels.length === 0) {
        return <div style={{ textAlign: "center", color: "gray", marginTop: "20px" }}>Nessun dato disponibile</div>;
    }

    return <Bar data={chartData} options={chartOptions} />;
};

export default AnomalyBarChart;
