import React from 'react';
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const AQIHealthImpacts = () => {
    const aqiLevels = [
        { range: '0 - 50', level: 'Bene', healthImplications: 'La qualità dell’aria è considerata soddisfacente e l’inquinamento atmosferico presenta rischi minimi o nulli', caution: 'Nessuno', color: '#28a745' },
        { range: '51 - 100', level: 'Moderare', healthImplications: 'La qualità dell\'aria è accettabile; tuttavia, per alcuni inquinanti potrebbe sussistere un moderato problema sanitario per un numero molto ristretto di persone insolitamente sensibili all’inquinamento atmosferico.', caution: 'I bambini e gli adulti attivi e le persone con malattie respiratorie, come l’asma, dovrebbero limitare lo sforzo prolungato all’aria aperta.', color: '#ffcc00' },
        { range: '101 - 150', level: 'Malsano per i gruppi sensibili', healthImplications: 'I membri di gruppi sensibili possono sperimentare effetti sulla salute. È improbabile che il pubblico in generale ne risenta.', caution: 'I bambini e gli adulti attivi e le persone con malattie respiratorie, come l’asma, dovrebbero limitare lo sforzo prolungato all’aria aperta.', color: '#ff9900' },
        { range: '151 - 200', level: 'Malsano', healthImplications: 'Tutti possono iniziare a sperimentare effetti sulla salute; i membri di gruppi sensibili possono sperimentare effetti sulla salute più gravi', caution: 'I bambini e gli adulti attivi e le persone con malattie respiratorie, come l\'asma, dovrebbero evitare sforzi prolungati all’aria aperta; tutti gli altri, soprattutto i bambini, dovrebbero limitare lo sforzo prolungato all’aria aperta.', color: '#ff5722' },
        { range: '201 - 300', level: 'Molto malsano', healthImplications: 'Avvisi sanitari sulle condizioni di emergenza. L’intera popolazione ha maggiori probabilità di essere colpita.', caution: 'I bambini e gli adulti attivi e le persone con malattie respiratorie, come l\'asma, dovrebbero evitare qualsiasi attività fisica all\'aria aperta; tutti gli altri, soprattutto i bambini, dovrebbero limitare lo sforzo all’aria aperta.', color: '#d32f2f' },
        { range: '300+', level: 'Pericoloso', healthImplications: 'Avviso sanitario: tutti potrebbero riscontrare effetti sulla salute più gravi', caution: 'Tutti dovrebbero evitare qualsiasi sforzo all’aria aperta.', color: '#b71c1c' }
    ];

    return (
        <Grid container spacing={2} justifyContent="center" mt={4}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    Implicazioni sulla salute in base ai livelli di AQI
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: '0.85rem' }}>AQI Range</TableCell>
                                <TableCell style={{ fontSize: '0.85rem' }}>Livello</TableCell>
                                <TableCell style={{ fontSize: '0.85rem' }}>Implicazioni sulla salute</TableCell>
                                <TableCell style={{ fontSize: '0.85rem' }}>Dichiarazione cautelativa</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aqiLevels.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell style={{ backgroundColor: row.color, color: 'white', fontSize: '0.85rem', padding: '6px 10px' }}>{row.range}</TableCell>
                                    <TableCell style={{ backgroundColor: row.color, color: 'white', fontSize: '0.85rem', padding: '6px 10px' }}>{row.level}</TableCell>
                                    <TableCell style={{ fontSize: '0.85rem', padding: '6px 10px' }}>{row.healthImplications}</TableCell>
                                    <TableCell style={{ fontSize: '0.85rem', padding: '6px 10px' }}>{row.caution}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default AQIHealthImpacts;
