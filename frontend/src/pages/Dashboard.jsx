import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Layout from '../components/Layout';
import axios from 'axios';
import AnomalyBarChart from '../components/AnomalyBarChart';
import No2TrendChart from '../components/No2BarChart';
import AnomalyLegends from '../components/AnomalyLegend';

const Dashboard = () => {
    const [pollutant, setPollutant] = useState('');
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [measurementData, setMeasurementData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dataRequested, setDataRequested] = useState(false);

    const cities = ['Roma', 'Milano'];

    const validateDates = () => {
        if (new Date(endDate) < new Date(startDate)) {
            setError("La data di fine non può essere precedente alla data di inizio.");
            return false;
        }
        setError('');
        return true;
    };

    const fetchMeasurements = async () => {
        if (!pollutant || !startDate || !endDate || !city) {
            setError("Seleziona l'inquinante, la città e entrambe le date.");
            return;
        }

        if (!validateDates()) return;

        setLoading(true);
        setError('');
        setDataRequested(true);

        try {
            const endpoint =
                pollutant === "no2"
                    ? `http://localhost:5000/api/measurements/${pollutant}/trend`
                    : `http://localhost:5000/api/measurements/${pollutant}/measurements`;

            const params =
                pollutant === "no2"
                    ? { startDate, endDate, granularity: "hourly", city }
                    : { startDate, endDate, granularity: "daily", city };

            const response = await axios.get(endpoint, { params });

            if (Array.isArray(response.data) && response.data.length > 0) {
                setMeasurementData(response.data);
            } else {
                setError("Nessun dato trovato per i parametri selezionati.");
            }
        } catch (err) {
            setError("Errore nel recupero dei dati.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom align="center" color="primary">
                Misurazioni per Inquinante
            </Typography>

            <Grid container spacing={2} justifyContent="center" mb={4}>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Inquinante</InputLabel>
                        <Select
                            value={pollutant}
                            onChange={(e) => {
                                setPollutant(e.target.value);
                                setMeasurementData([]);
                                setError('');
                                setDataRequested(false);
                            }}
                            label="Inquinante"
                        >
                            <MenuItem value="pm25">PM2.5</MenuItem>
                            <MenuItem value="pm10">PM10</MenuItem>
                            <MenuItem value="no2">Diossido di Azoto (NO2)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Seleziona Città</InputLabel>
                        <Select
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setMeasurementData([]);
                                setError('');
                                setDataRequested(false);
                            }}
                            label="Seleziona Città"
                        >
                            {cities.map((cityOption, index) => (
                                <MenuItem key={index} value={cityOption}>
                                    {cityOption}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        type="date"
                        label="Data Inizio"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        type="date"
                        label="Data Fine"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onBlur={validateDates}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={fetchMeasurements}
                        disabled={loading || !pollutant || !startDate || !endDate || !city}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Aggiorna Dati'}
                    </Button>
                </Grid>
            </Grid>

            {dataRequested && error && <Typography color="error" align="center" variant="body1">{error}</Typography>}

            {dataRequested && !loading && !error && measurementData.length > 0 && (
                <Typography color="primary" align="center" variant="h6" gutterBottom>
                    Dati caricati con successo!
                </Typography>
            )}

            {measurementData.length > 0 ? (
                pollutant === "no2" ? (
                    <No2TrendChart anomalyData={measurementData} />
                ) : (
                    <AnomalyBarChart anomalyData={measurementData} type={pollutant} />
                )
            ) : (
                dataRequested &&
                !loading &&
                !error && (
                    <Typography variant="h6" align="center" gutterBottom>
                        Nessun dato disponibile per i parametri selezionati.
                    </Typography>
                )
            )}

            <AnomalyLegends />
        </Layout>
    );
};

export default Dashboard;
