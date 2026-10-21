import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert, Grid, Button, TextField, MenuItem, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Web3 } from 'web3';
import contractData from '../abis/AirQuality.json';
import Layout from '../components/Layout';

const AdminDashboard = () => {
    const [city, setCity] = useState('Roma');
    const [pollutant, setPollutant] = useState('pm10');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [transactionCost, setTransactionCost] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [data, setData] = useState([]);

    const cityCoordinates = {
        Roma: [41.9028, 12.4964],
        Milano: [45.4642, 9.1900]
    };

    const handleUploadToBlockchain = async () => {
        if (!window.ethereum) {
            alert("Ethereum wallet not detected. Please install MetaMask.");
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            const networkId = await web3.eth.net.getId();
            const contract = new web3.eth.Contract(contractData.abi, contractData.networks[networkId].address);

            const response = await axios.get(`http://localhost:5000/api/measurements/${pollutant}/daily-average`, {
                params: { city }
            });

            let totalGasCost = BigInt(0);
            let skippedCount = 0;

            for (let i = 0; i < response.data.length; i++) {
                const dayData = response.data[i];
                const timestamp = Math.floor(new Date(dayData._id).getTime() / 1000);
                const averageValue = Math.round(dayData.average_value * 1000);
                const granularity = 'daily';

                const exists = await contract.methods.dataExists(pollutant, timestamp, city, granularity).call();
                console.log(`Checking if exists - Pollutant: ${pollutant}, Timestamp: ${timestamp}, City: ${city}, Granularity: ${granularity} → Exists: ${exists}`);

                if (exists) {
                    skippedCount++;
                    continue;
                }

                const gasEstimate = await contract.methods.storePollutionData(
                    pollutant, averageValue, timestamp, city, granularity
                ).estimateGas({ from: account });

                totalGasCost += BigInt(gasEstimate);

                const gasPrice = await web3.eth.getGasPrice();

                await contract.methods.storePollutionData(
                    pollutant, averageValue, timestamp, city, granularity
                ).send({ from: account, gas: gasEstimate, gasPrice });
            }

            const totalGasPrice = await web3.eth.getGasPrice();
            const totalCostInWei = totalGasCost * BigInt(totalGasPrice);
            const totalCostInEther = web3.utils.fromWei(totalCostInWei.toString(), 'ether');

            setTransactionCost(totalCostInEther);
            setOpenSnackbar(true);

            setSuccessMessage(`Dati caricati con successo! Skippati: ${skippedCount}`);

        } catch (error) {
            console.error("Errore durante il caricamento sulla Blockchain", error);
            setErrorMessage("Si è verificato un errore durante il caricamento dei dati.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/measurements/${pollutant}/daily-average`, {
                    params: { city }
                });
                setData(response.data);
            } catch (error) {
                console.error("Errore nel recupero dei dati", error);
            }
        };

        fetchData();
    }, [city, pollutant]);

    return (
        <Layout>
            <div>
                <Typography variant="h3" align="center" gutterBottom>
                    Dashboard Amministratore
                </Typography>

                <Grid container spacing={2} justifyContent="center" mb={4}>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            label="Città"
                            fullWidth
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        >
                            {Object.keys(cityCoordinates).map((cityName) => (
                                <MenuItem key={cityName} value={cityName}>
                                    {cityName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            label="Inquinante"
                            fullWidth
                            value={pollutant}
                            onChange={(e) => setPollutant(e.target.value)}
                        >
                            <MenuItem value="pm25">PM2.5</MenuItem>
                            <MenuItem value="pm10">PM10</MenuItem>
                            <MenuItem value="no">NO</MenuItem>
                            <MenuItem value="no2">NO2</MenuItem>
                            <MenuItem value="nox">NOX</MenuItem>
                            <MenuItem value="o3">O3</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleUploadToBlockchain}
                            >
                                Carica Dati sulla Blockchain
                            </Button>
                        )}
                    </Grid>
                </Grid>

                <Typography variant="h6" color='blue' align="center" paragraph>
                   Nella tabella sono presenti i dati che puoi caricare con questa combinazione.
                </Typography>

                <Typography variant="h7" color='blue' align="center" paragraph>
                    I tempi di caricamenti potrebbero essere lunghi, si prega di attendere.
                </Typography>

                {successMessage && (
                    <Typography variant="h6" color="green" align="center">
                        {successMessage}
                    </Typography>
                )}

                {errorMessage && (
                    <Typography variant="h6" color="red" align="center">
                        {errorMessage}
                    </Typography>
                )}

                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={6000}
                    onClose={() => setOpenSnackbar(false)}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
                        Costo della transazione: {transactionCost} ETH
                    </Alert>
                </Snackbar>

                <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 600, overflowX: 'auto' }}>
                    <Table stickyHeader sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#2196F3',
                                        color: '#fff',
                                        fontSize: '1rem',
                                    }}
                                >
                                    Città
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#2196F3',
                                        color: '#fff',
                                        fontSize: '1rem',
                                    }}
                                >
                                    Inquinante
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#2196F3',
                                        color: '#fff',
                                        fontSize: '1rem',
                                    }}
                                >
                                    Data
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#2196F3',
                                        color: '#fff',
                                        fontSize: '1rem',
                                    }}
                                >
                                    Valore Medio Giornaliero(µg/m³)
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(data) && data.length > 0 ? (
                                data.map((dayData, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? '#E3F2FD' : '#F1F8E9' }}>
                                        <TableCell>{city}</TableCell>
                                        <TableCell>{pollutant}</TableCell>
                                        <TableCell>{new Date(dayData._id).toLocaleDateString()}</TableCell>
                                        <TableCell>{(dayData.average_value).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Nessun dato disponibile
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
