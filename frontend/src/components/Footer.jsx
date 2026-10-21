import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            sx={{
                backgroundColor: '#333',
                color: 'white',
                padding: '20px 0',
                marginTop: '20px',
                textAlign: 'center',
                position: 'relative',
                bottom: 0,
                width: '100%',
            }}
        >
            <Typography variant="body2">
                © 2025 Progetto Big Data. Tutti i diritti riservati.
            </Typography>
            <Typography variant="body2">
                <Link href="/" color="inherit" style={{ textDecoration: 'none' }}>
                    Privacy Policy
                </Link> |
                <Link href="/" color="inherit" style={{ textDecoration: 'none' }}>
                    Termini di Servizio
                </Link>
            </Typography>
        </Box>
    );
};

export default Footer;
