import React, { useState } from 'react';
import {
    Grid,
    TextField,
    Button,
    Typography,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
} from '@mui/material';
import Layout from '../components/Layout';
import axios from 'axios';
import AQIBarChart from '../components/AQIBarChart';
import AQIHealthImpacts from '../components/AQIHealthImpacts';
import AQIExplanation from '../components/AQIExplanation';

const AirQuality = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [aqiData, setAqiData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [datesSelected, setDatesSelected] = useState(false);
    const [dataRequested, setDataRequested] = useState(false);
    const [city, setCity] = useState('');
    const [showGraph, setShowGraph] = useState(false);

    const cities = ['Roma', 'Milano'];

    const fetchAQIData = async () => {
        if (!startDate || !endDate || !city) {
            setError('Seleziona una città e entrambe le date.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('La data di inizio deve essere precedente alla data di fine.');
            return;
        }

        setLoading(true);
        setError('');
        setDataRequested(true);

        try {
            const response = await axios.get('http://localhost:5000/api/measurements/aqi', {
                params: { startDate, endDate, city },
            });

            if (response.data && Array.isArray(response.data.aqiData)) {
                if (response.data.aqiData.length === 0) {
                    setError('Nessun dato AQI trovato per il periodo selezionato.');
                    setShowGraph(false);
                } else {
                    setAqiData(response.data.aqiData);
                    setShowGraph(true);
                }
            } else {
                setError('I dati ricevuti non sono nel formato previsto.');
                setShowGraph(false);
            }
        } catch (err) {
            setError('Errore nel recupero dei dati AQI');
            setShowGraph(false);
        } finally {
            setLoading(false);
        }
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
        setDatesSelected(true);
        setShowGraph(false);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
        setDatesSelected(true);
        setShowGraph(false);
    };

    const handleCityChange = (e) => {
        setCity(e.target.value);
        setShowGraph(false);
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom align="center" color="primary">
                Monitoraggio della Qualità dell'Aria
            </Typography>

            <Grid container spacing={2} justifyContent="center" mb={4}>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Seleziona Città</InputLabel>
                        <Select value={city} onChange={handleCityChange} label="Seleziona Città">
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
                        onChange={handleStartDateChange}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        type="date"
                        label="Data Fine"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={fetchAQIData}
                        disabled={loading || !datesSelected || !city}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Aggiorna Dati'}
                    </Button>
                </Grid>
            </Grid>

            {dataRequested && error && <Typography color="error">{error}</Typography>}

            {showGraph && aqiData.length > 0 && <AQIBarChart aqiData={aqiData} />}

            {!showGraph && dataRequested && !loading && !error && aqiData.length === 0 && (
                <Typography variant="h6" gutterBottom>
                    Dati AQI non disponibili per il periodo selezionato.
                </Typography>
            )}

            <AQIHealthImpacts />

            <Box sx={{ padding: 2, backgroundColor: '#f0f0f0', borderRadius: 1, marginTop: 2 }}>
                <AQIExplanation />
            </Box>
        </Layout>
    );
};

export default AirQuality;
