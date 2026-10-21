import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

const AQIExplanation = () => {
    return (
        <Box mt={6} px={2}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
                Come viene calcolato l'AQI?
            </Typography>

            <Typography variant="body1" paragraph align="justify">
                L'Indice di Qualità dell'Aria (AQI) è un valore che rappresenta la qualità dell'aria in un dato momento, basato sulla concentrazione di vari inquinanti atmosferici. La formula utilizzata per calcolare l'AQI è la seguente:
            </Typography>

            <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Formula di Calcolo dell'AQI:
                </Typography>
                <Typography variant="body2" component="code" sx={{
                    fontFamily: 'Courier New',
                    backgroundColor: '#fafafa',
                    padding: 2,
                    borderRadius: 1,
                    display: 'block',
                    wordWrap: 'break-word'
                }}>
                    AQI = ( ( AQI<sub>High</sub> - AQI<sub>Low</sub> ) / ( Concentration<sub>High</sub> - Concentration<sub>Low</sub> ) ) * ( Concentration - Concentration<sub>Low</sub> ) + AQI<sub>Low</sub>
                </Typography>
            </Paper>

            <Typography variant="body1" paragraph align="justify">
                Dove:
            </Typography>

            <Box ml={2} mb={4}>
                <Typography variant="body2" paragraph>
                    <strong>Concentration</strong>: La concentrazione del contaminante misurato (ad esempio PM2.5, NO2, O3, ecc.).
                </Typography>
                <Typography variant="body2" paragraph>
                    <strong>Concentration_Low</strong> e <strong>Concentration_High</strong>: I limiti minimi e massimi di concentrazione per quel range di qualità dell'aria.
                </Typography>
                <Typography variant="body2" paragraph>
                    <strong>AQI_Low</strong> e <strong>AQI_High</strong>: I valori minimi e massimi dell'AQI per quel range di concentrazione.
                </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="body1" paragraph align="justify">
                In pratica, il calcolo dell'AQI avviene applicando questa formula alla concentrazione di ogni inquinante misurato. Il valore risultante dell'AQI sarà un numero compreso tra 0 e 500, dove valori più alti indicano una qualità dell'aria peggiore.
            </Typography>
        </Box>
    );
};

export default AQIExplanation;
