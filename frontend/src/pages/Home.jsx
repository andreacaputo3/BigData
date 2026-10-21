import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import {
    Typography,
    Grid,
    Button,
    TextField,
    MenuItem,
    Box
} from '@mui/material';
import { CircularProgress } from '@mui/material';
import { Web3 } from 'web3';
import contractData from '../abis/AirQuality.json';
import LineChart from '../components/LineChart';
import MapComponent from '../components/MapComponent';

const Home = () => {
    const [pollutantData, setPollutantData] = useState([]);
    const [pollutant, setPollutant] = useState('pm25');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [city, setCity] = useState('Roma');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [mapCenter, setMapCenter] = useState([41.9028, 12.4964]);
    const [loading, setLoading] = useState(false);
    const [initialBalancePositive, setInitialBalancePositive] = useState(false);

    const cityCoordinates = {
        Roma: [41.9028, 12.4964],
        Milano: [45.4642, 9.1900]
    };

    const getContractInstance = async () => {
        if (!window.ethereum) {
            throw new Error('Ethereum wallet non rilevato. Installa MetaMask.');
        }

        const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        const networkId = await web3.eth.net.getId();

        if (!contractData.networks[networkId]) {
            throw new Error('Il contratto non è stato distribuito sulla rete corrente.');
        }

        const contract = new web3.eth.Contract(contractData.abi, contractData.networks[networkId].address);

        return { web3, accounts, currentAccount, contract };
    };

    const fetchUserBalance = async () => {
        try {
            const { contract, currentAccount } = await getContractInstance();
            const balance = await contract.methods.getBalance(currentAccount).call();
            const balanceNumber = Number(balance);
            setUserBalance(balanceNumber);

            if (balanceNumber > 0) {
                setInitialBalancePositive(true);
            }
        } catch (error) {
            console.error('Errore nel recupero del saldo:', error);
        }
    };

    const decreaseBalance = async () => {
        try {
            const { contract, currentAccount } = await getContractInstance();
            await contract.methods.decrementUserBalance().send({
                from: currentAccount,
                gas: 2000000,
                gasPrice: Web3.utils.toWei('20', 'gwei')
            });
            fetchUserBalance();
        } catch (error) {
            console.error('Errore nel decremento del saldo:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setErrorMessage('');
        setHasSearched(false);

        if (userBalance <= 0) {
            setErrorMessage('Credito insufficiente per visualizzare i dati.');
            setLoading(false);
            return;
        }

        try {
            const { contract, currentAccount } = await getContractInstance();

            const startTimestamp = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
            const endTimestamp = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;

            const result = await contract.methods
                .getPollutionDataByCityParameterAndTime(city, pollutant, startTimestamp, endTimestamp)
                .call({ from: currentAccount });

            if (!result || result.length === 0) {
                setErrorMessage('Nessun dato trovato.');
                setLoading(false);
                return;
            }

            const formattedData = result.map(entry => ({
                _id: entry.id.toString(),
                parameter: entry.parameter,
                average_value: entry.value ? Number(entry.value) : 0,
                datetimeUtc: entry.datetimeUtc ? Number(entry.datetimeUtc) * 1000 : '',
                location_name: entry.location_name,
                granularity: entry.granularity,
            })).filter(entry => entry !== null);

            if (formattedData.length === 0) {
                setErrorMessage('Errore nei dati ricevuti.');
                setLoading(false);
                return;
            }

            setPollutantData(formattedData);
            setHasSearched(true);

            decreaseBalance();

        } catch (error) {
            console.error("Errore nel recupero dei dati:", error);
            setErrorMessage('Errore nel recupero dei dati dalla blockchain.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserBalance();
    }, []);

    return (
        <Layout>
            <Typography variant="h3" align="center" gutterBottom>
                Benvenuto
            </Typography>
            <Typography variant="h5" align="center" paragraph>
                Acquista crediti e Visualizza i dati!
            </Typography>

            <Box mt={5} mb={5} sx={{ width: '100%' }}>
                {mapCenter && (
                    <MapComponent center={mapCenter} height="250px" />
                )}
            </Box>

            <Grid container spacing={2} justifyContent="center" mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Città" fullWidth value={city} onChange={(e) => {
                        const selectedCity = e.target.value;
                        setCity(selectedCity);
                        setMapCenter(cityCoordinates[selectedCity]);
                    }}>
                        {Object.keys(cityCoordinates).map((cityName) => (
                            <MenuItem key={cityName} value={cityName}>{cityName}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField select label="Inquinante" fullWidth value={pollutant} onChange={(e) => setPollutant(e.target.value)}>
                        <MenuItem value="pm25">PM2.5</MenuItem>
                        <MenuItem value="pm10">PM10</MenuItem>
                        <MenuItem value="no">NO</MenuItem>
                        <MenuItem value="no2">NO2</MenuItem>
                        <MenuItem value="nox">NOX</MenuItem>
                        <MenuItem value="o3">O3</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField type="date" fullWidth label="Data Inizio" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField type="date" fullWidth label="Data Fine" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Grid>
            </Grid>

            <Grid container justifyContent="center" mb={5} direction="column" alignItems="center">
                <Button variant="contained" color="primary" onClick={fetchData} disabled={userBalance <= 0}>
                    Cerca
                </Button>
                {userBalance === 0 && (
                    <Typography color="error" align="center" mt={1}>
                        Credito insufficiente. Acquista più crediti per visualizzare i dati.
                    </Typography>
                )}
            </Grid>

            <Typography variant="h6" align="center" mt={2} color={userBalance > 0 ? "primary" : "error"}>
                Crediti disponibile: {userBalance} token
            </Typography>

            {loading && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                </Box>
            )}

            {errorMessage && (
                <Typography color="error" align="center">{errorMessage}</Typography>
            )}
            {hasSearched && (userBalance > 0 || initialBalancePositive) && (
                <Box mt={5}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Dati per {pollutant.toUpperCase()} a {city}
                    </Typography>
                    <LineChart data={pollutantData} />
                </Box>
            )}
        </Layout>
    );
};

export default Home;
