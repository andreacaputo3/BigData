import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, Typography, Box, TextField, Card, CardContent, CircularProgress, Stack } from '@mui/material';
import Layout from '../components/Layout';
import contractData from '../abis/AirQuality.json';

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

const Wallet = () => {
    const [account, setAccount] = useState('');
    const [userBalance, setUserBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [creditAmount, setCreditAmount] = useState(1);
    const [pricePerCredit, setPricePerCredit] = useState(null);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    const loadBlockchainData = async () => {
        try {
            const { web3, accounts, contract } = await getContractInstance();
            setAccount(accounts[0]);

            const userCredits = await contract.methods.userBalances(accounts[0]).call();
            setUserBalance(userCredits.toString());

            const price = await contract.methods.pricePerCreditInWei().call();
            setPricePerCredit(web3.utils.fromWei(price, 'ether'));
        } catch (error) {
            console.error('Errore nel recupero dei dati:', error);
            setUserBalance('Errore');
        }
    };

    const handlePurchaseBalance = async () => {
        setLoading(true);
        try {
            const { web3, accounts, contract } = await getContractInstance();

            const pricePerCreditWei = await contract.methods.pricePerCreditInWei().call();
            const totalValue = BigInt(pricePerCreditWei) * BigInt(creditAmount);

            const gasPrice = await web3.eth.getGasPrice();

            await contract.methods.purchaseCredits().send({
                from: accounts[0],
                value: totalValue.toString(),
                gasPrice: gasPrice
            });

            alert('Acquisto completato!');
            loadBlockchainData();
        } catch (error) {
            console.error('Errore durante l’acquisto:', error);
            alert('Errore durante l’acquisto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Card sx={{ width: 400, p: 3, boxShadow: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h5" textAlign="center" gutterBottom>
                            💰 Wallet
                        </Typography>

                        <Stack spacing={2} alignItems="center">
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                <strong>Account:</strong> {account ? account : "Non connesso"}
                            </Typography>

                            <Typography variant="h6" color="primary">
                                Saldo: {userBalance} Crediti
                            </Typography>

                            {pricePerCredit !== null && (
                                <Typography variant="body2" color="textSecondary">
                                    Costo per credito: <strong>{pricePerCredit} ETH</strong>
                                </Typography>
                            )}

                            <TextField
                                type="number"
                                label="Crediti da acquistare"
                                variant="outlined"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                fullWidth
                            />

                            {pricePerCredit !== null && (
                                <Typography variant="body2" color="textSecondary">
                                    Costo totale: <strong>{(creditAmount * pricePerCredit).toFixed(6)} ETH</strong>
                                </Typography>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePurchaseBalance}
                                disabled={loading || creditAmount <= 0}
                                fullWidth
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : `Acquista ${creditAmount} Crediti`}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Layout>
    );
};

export default Wallet;
