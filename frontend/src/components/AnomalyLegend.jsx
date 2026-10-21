import React from "react";
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const LegendTable = ({ title, data }) => (
    <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
            {title}
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                        <TableCell sx={{ fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>Range</TableCell>
                        <TableCell sx={{ fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>Livello</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ backgroundColor: row.color, color: "white", fontSize: "13px", padding: "10px", textAlign: "center" }}>
                                {row.range}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: row.color, color: "white", fontSize: "13px", padding: "10px", textAlign: "center" }}>
                                {row.level}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Grid>
);

const AnomalyLegends = () => {
    const pm25Levels = [
        { range: "0 - 12 µg/m³", level: "Ottima", color: "#4caf50" },
        { range: "12.1 - 35.4 µg/m³", level: "Buona", color: "#ffeb3b" },
        { range: "35.5 - 55.4 µg/m³", level: "Moderata", color: "#ff9800" },
        { range: "55.5 - 150.4 µg/m³", level: "Non salutare per gruppi sensibili", color: "#f44336" },
        { range: "150.5 - 250.4 µg/m³", level: "Non salutare", color: "#d32f2f" },
        { range: "250.5 - 500 µg/m³", level: "Molto non salutare", color: "#b71c1c" },
    ];

    const pm10Levels = [
        { range: "0 - 20 µg/m³", level: "Ottima", color: "#4caf50" },
        { range: "20.1 - 50 µg/m³", level: "Buona", color: "#ffeb3b" },
        { range: "51 - 100 µg/m³", level: "Moderata", color: "#ff9800" },
        { range: "101 - 200 µg/m³", level: "Non salutare per gruppi sensibili", color: "#f44336" },
        { range: "201 - 300 µg/m³", level: "Non salutare", color: "#d32f2f" },
        { range: "> 300 µg/m³", level: "Molto non salutare", color: "#b71c1c" },
    ];

    const no2Levels = [
        { range: "0 - 25 µg/m³", level: "Ottima", color: "#4caf50" },
        { range: "26 - 50 µg/m³", level: "Buona", color: "#ffeb3b" },
        { range: "51 - 100 µg/m³", level: "Moderata", color: "#ff9800" },
        { range: "101 - 200 µg/m³", level: "Non salutare per gruppi sensibili", color: "#f44336" },
        { range: "201 - 400 µg/m³", level: "Non salutare", color: "#d32f2f" },
        { range: "> 400 µg/m³", level: "Molto non salutare", color: "#b71c1c" },
    ];

    return (
        <Grid container spacing={3} justifyContent="center" mt={4}>
            <LegendTable title="Legenda PM2.5 - Livelli di Inquinamento" data={pm25Levels} />
            <LegendTable title="Legenda PM10 - Livelli di Inquinamento" data={pm10Levels} />
            <LegendTable title="Legenda NO2 - Livelli di Inquinamento" data={no2Levels} />
        </Grid>
    );
};

export default AnomalyLegends;
