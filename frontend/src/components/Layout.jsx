import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Container } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container style={{ flex: 1, marginTop: '20px' }}>
                {children}
            </Container>
            <Footer />
        </div>
    );
};

export default Layout;
