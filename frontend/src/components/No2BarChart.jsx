import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getColorForValue = (value) => {
    if (value <= 25) return "rgba(76, 175, 80, 0.6)"; // Verde chiaro
    if (value <= 50) return "rgba(255, 235, 59, 0.6)"; // Giallo
    if (value <= 100) return "rgba(255, 152, 0, 0.6)"; // Arancio
    if (value <= 200) return "rgba(244, 67, 54, 0.6)"; // Rosso
    if (value <= 400) return "rgba(211, 47, 47, 0.6)"; // Rosso scuro
    return "rgba(183, 28, 28, 0.6)"; // Rosso intenso
};

const No2BarChart = ({ anomalyData }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (!anomalyData || anomalyData.length === 0) {
            setChartData({});
            return;
        }

        const labels = anomalyData.map((data) => {
            if (data._id) {
                const [datePart, hourPart] = data._id.split(" ");
                const date = new Date(datePart);
                if (!isNaN(date.getTime())) {
                    return `${date.toLocaleDateString("it-IT")} ${hourPart || ""}`.trim();
                }
                return data._id;
            }
            return "Data non disponibile";
        });

        const maxValues = anomalyData.map((data) => data.max_value);
        const colors = anomalyData.map((data) => getColorForValue(data.max_value));

        setChartData({
            labels,
            datasets: [
                {
                    label: "NO2",
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
                    text: "Valori Inquinamento (NO2)",
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
                        text: "Data e Ora",
                    },
                },
            },
        });
    }, [anomalyData]);

    if (!chartData.labels || chartData.labels.length === 0) {
        return <div style={{ textAlign: "center", color: "gray", marginTop: "20px" }}>Nessun dato disponibile</div>;
    }

    return <Bar data={chartData} options={chartOptions} />;
};

export default No2BarChart;
