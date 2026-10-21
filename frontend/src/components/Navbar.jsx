import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractData from '../abis/AirQuality.json';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const web3 = new Web3(window.ethereum || 'http://localhost:8545');

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const currentAccount = accounts[0];
                console.log("Account corrente da MetaMask:", currentAccount);

                let networkId = await web3.eth.net.getId();
                networkId = Number(networkId);
                console.log("Network ID (dopo la conversione):", networkId);

                const contractAddress = contractData.networks[networkId]?.address;
                if (!contractAddress) {
                    console.error("Contratto non trovato sulla rete selezionata");
                    return;
                }

                const contract = new web3.eth.Contract(contractData.abi, contractAddress);
                const result = await contract.methods.isAdmin(currentAccount).call();
                setIsAdmin(result);
            } catch (error) {
                console.error("Errore durante la verifica dello stato dell'admin:", error);
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', checkAdminStatus);
            window.ethereum.on('chainChanged', checkAdminStatus);
            checkAdminStatus();
        } else {
            console.error("MetaMask non è installato o non è disponibile.");
        }
    }, []);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Big Data Management
                </Typography>
                <Button color="inherit" component={Link} to="/">
                    Home
                </Button>

                {isAdmin && (
                    <Button color="inherit" component={Link} to="/aqi">
                        AQI
                    </Button>
                )}
                {isAdmin && (
                    <Button color="inherit" component={Link} to="/dashboard">
                        Misurazioni
                    </Button>
                )}
                <Button color="inherit" component={Link} to="/wallet">
                    Wallet
                </Button>
                {isAdmin && (
                    <Button color="inherit" component={Link} to="/dashboardAdmin">
                        Admin
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
